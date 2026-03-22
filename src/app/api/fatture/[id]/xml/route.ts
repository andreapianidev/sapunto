import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: GET /api/fatture/[id]/xml?tenantId=xxx
 *
 * Genera e scarica il file XML FatturaPA per una fattura specifica.
 * L'XML generato e' conforme allo standard FatturaPA 1.2.2
 * per l'invio tramite Sistema di Interscambio (SDI).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId obbligatorio' },
        { status: 400 }
      );
    }

    // Lazy imports per compatibilita' Vercel build
    const dal = await import('@/lib/db/dal');
    const { generateFatturaPA, mapFatturaToSDI } = await import('@/lib/sdi');

    // Carica fattura
    const fattura = await dal.getFatturaById(id);
    if (!fattura) {
      return NextResponse.json(
        { error: 'Fattura non trovata' },
        { status: 404 }
      );
    }

    // Verifica che la fattura appartenga al tenant
    if (fattura.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Fattura non appartenente al tenant' },
        { status: 403 }
      );
    }

    // Carica il tenant (emittente)
    const tenant = await dal.getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant non trovato' },
        { status: 404 }
      );
    }

    // Carica il cliente (cessionario)
    const cliente = await dal.getClienteById(fattura.clienteId);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    // Genera progressivo invio univoco
    const progressivoInvio = `${tenant.partitaIva.slice(-5)}_${fattura.numero.replace(/[^a-zA-Z0-9]/g, '')}`;

    // Mappa i dati e genera XML
    const datiFattura = mapFatturaToSDI({
      fattura: {
        numero: fattura.numero,
        data: fattura.data,
        dataScadenza: fattura.dataScadenza,
        righe: (fattura.righe || []).map((r) => ({
          nome: r.nome,
          quantita: r.quantita,
          prezzoUnitario: r.prezzoUnitario,
          iva: r.iva,
          totale: r.totale,
        })),
        subtotale: fattura.subtotale,
        iva: fattura.iva,
        totale: fattura.totale,
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
      cliente: {
        ragioneSociale: cliente.ragioneSociale,
        partitaIva: cliente.partitaIva,
        codiceFiscale: cliente.codiceFiscale,
        indirizzo: cliente.indirizzo,
        citta: cliente.citta,
        cap: cliente.cap,
        provincia: cliente.provincia,
        pec: cliente.pec,
        codiceDestinatario: cliente.codiceDestinatario,
      },
      progressivoInvio,
    });

    const xml = generateFatturaPA(datiFattura);

    // Nome file conforme alle specifiche SDI:
    // IT{partitaIva}_{progressivoInvio}.xml
    const nomeFile = `IT${tenant.partitaIva}_${progressivoInvio}.xml`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${nomeFile}"`,
      },
    });
  } catch (error) {
    console.error('Errore generazione XML FatturaPA:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione del file XML' },
      { status: 500 }
    );
  }
}
