import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId richiesto' }, { status: 400 });
    }

    // Lazy imports per compatibilita' Vercel build (env vars non disponibili a build time)
    const { db } = await import('@/lib/db');
    const { eq } = await import('drizzle-orm');
    const schema = await import('@/lib/db/schema');
    const { generateCedolinoPDF } = await import('@/lib/pdf');

    // Load cedolino
    const cedoliniRows = await db.select().from(schema.cedolini).where(eq(schema.cedolini.id, id));
    const cedolino = cedoliniRows[0];

    if (!cedolino || cedolino.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Cedolino non trovato' }, { status: 404 });
    }

    // Load dipendente
    const dipendentiRows = await db.select().from(schema.dipendenti).where(eq(schema.dipendenti.id, cedolino.dipendenteId));
    const dipendente = dipendentiRows[0];

    if (!dipendente) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 });
    }

    // Load tenant (azienda)
    const tenantsRows = await db.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId));
    const tenant = tenantsRows[0];

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 });
    }

    // Generate PDF
    const meseNomi = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
    ];
    const meseLabel = meseNomi[cedolino.mese - 1] || String(cedolino.mese);

    const pdfBuffer = await generateCedolinoPDF({
      cedolino: {
        mese: cedolino.mese,
        anno: cedolino.anno,
        lordo: parseFloat(cedolino.lordo),
        contributiInps: parseFloat(cedolino.contributiInps),
        irpef: parseFloat(cedolino.irpef),
        addizionaleRegionale: parseFloat(cedolino.addizionaleRegionale),
        addizionaleComunale: parseFloat(cedolino.addizionaleComunale),
        altreRitenute: parseFloat(cedolino.altreRitenute),
        netto: parseFloat(cedolino.netto),
        dataEmissione: cedolino.dataEmissione,
      },
      dipendente: {
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        codiceFiscale: dipendente.codiceFiscale,
        ruoloAziendale: dipendente.ruoloAziendale,
        tipoContratto: dipendente.tipoContratto,
        livello: dipendente.livello,
        dataAssunzione: dipendente.dataAssunzione,
        iban: dipendente.iban,
      },
      azienda: {
        ragioneSociale: tenant.ragioneSociale,
        partitaIva: tenant.partitaIva,
        indirizzo: tenant.indirizzo,
        citta: tenant.citta,
      },
    });

    const filename = `cedolino-${dipendente.cognome}-${meseLabel}-${cedolino.anno}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('[Cedolino PDF] Error:', error);
    return NextResponse.json({ error: 'Errore nella generazione del PDF' }, { status: 500 });
  }
}
