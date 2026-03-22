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
    const { generateFatturaPDF } = await import('@/lib/pdf');

    // Load fattura
    const fattureRows = await db.select().from(schema.fatture).where(eq(schema.fatture.id, id));
    const fattura = fattureRows[0];

    if (!fattura || fattura.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404 });
    }

    // Load client
    const clientiRows = await db.select().from(schema.clienti).where(eq(schema.clienti.id, fattura.clienteId));
    const cliente = clientiRows[0];

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    // Load tenant (emittente)
    const tenantsRows = await db.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId));
    const tenant = tenantsRows[0];

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateFatturaPDF({
      fattura: {
        numero: fattura.numero,
        tipo: fattura.tipo,
        data: fattura.data,
        dataScadenza: fattura.dataScadenza,
        stato: fattura.stato,
        statoSDI: fattura.statoSDI,
        righe: (fattura.righe || []).map((r) => ({
          nome: r.nome,
          quantita: r.quantita,
          prezzoUnitario: r.prezzoUnitario,
          iva: r.iva,
          totale: r.totale,
        })),
        subtotale: parseFloat(fattura.subtotale),
        iva: parseFloat(fattura.iva),
        totale: parseFloat(fattura.totale),
      },
      cliente: {
        ragioneSociale: cliente.ragioneSociale,
        partitaIva: cliente.partitaIva,
        codiceFiscale: cliente.codiceFiscale,
        indirizzo: cliente.indirizzo,
        citta: cliente.citta,
        cap: cliente.cap,
        provincia: cliente.provincia,
        pec: cliente.pec ?? undefined,
        codiceDestinatario: cliente.codiceDestinatario ?? undefined,
      },
      emittente: {
        ragioneSociale: tenant.ragioneSociale,
        partitaIva: tenant.partitaIva,
        codiceFiscale: tenant.codiceFiscale,
        indirizzo: tenant.indirizzo,
        citta: tenant.citta,
        cap: tenant.cap,
        provincia: tenant.provincia,
        telefono: tenant.telefono,
        email: tenant.email,
        pec: tenant.pec,
      },
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fattura-${fattura.numero}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('[Fattura PDF] Error:', error);
    return NextResponse.json({ error: 'Errore nella generazione del PDF' }, { status: 500 });
  }
}
