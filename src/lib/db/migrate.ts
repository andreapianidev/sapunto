import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

function execQuery(query: string): string {
  const host = new URL(DATABASE_URL!).hostname;
  const apiUrl = `https://${host}/sql`;
  const body = JSON.stringify({ query });

  const result = execSync(
    `curl -s -X POST "${apiUrl}" -H "Content-Type: application/json" -H "Neon-Connection-String: ${DATABASE_URL}" -d '${body.replace(/'/g, "'\\''")}'`,
    { encoding: 'utf-8', timeout: 30000 }
  );
  return result;
}

async function migrate() {
  console.log('🔄 Running migration via Neon HTTP API...');

  const migrationPath = join(process.cwd(), 'drizzle', '0000_odd_king_cobra.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  const statements = migrationSQL
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    console.log(`  [${i + 1}/${statements.length}] ${statements[i].substring(0, 60)}...`);
    try {
      const result = execQuery(statements[i]);
      const parsed = JSON.parse(result);
      if (parsed.message) {
        if (parsed.message.includes('already exists')) {
          console.log(`    ⚠️  Skipped (already exists)`);
        } else {
          console.error(`    ❌ Error: ${parsed.message}`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('already exists')) {
        console.log(`    ⚠️  Skipped (already exists)`);
      } else {
        console.error(`    ❌ Failed: ${message}`);
      }
    }
  }

  console.log('✅ Migration completed!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
