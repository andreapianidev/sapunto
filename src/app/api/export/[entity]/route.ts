import { NextRequest, NextResponse } from 'next/server';
import {
  clientiToCSV,
  ordiniToCSV,
  fattureToCSV,
  prodottiToCSV,
  preventiviToCSV,
  leadsToCSV,
  speseToCSV,
  dipendentiToCSV,
  contrattiToCSV,
  ticketsToCSV,
} from '@/lib/csv';

const SUPPORTED_ENTITIES = [
  'clienti', 'ordini', 'fatture', 'prodotti', 'preventivi',
  'leads', 'spese', 'dipendenti', 'contratti', 'tickets',
] as const;

type EntityType = typeof SUPPORTED_ENTITIES[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Parametro tenantId obbligatorio' },
      { status: 400 }
    );
  }

  if (!SUPPORTED_ENTITIES.includes(entity as EntityType)) {
    return NextResponse.json(
      { error: `Entità "${entity}" non supportata. Entità valide: ${SUPPORTED_ENTITIES.join(', ')}` },
      { status: 404 }
    );
  }

  try {
    // Lazy import of DAL to avoid top-level env var dependency
    const dal = await import('@/lib/db/dal');
    let csv: string;
    let filename: string;

    switch (entity as EntityType) {
      case 'clienti': {
        const data = await dal.getClienti(tenantId);
        csv = clientiToCSV(data);
        filename = 'clienti.csv';
        break;
      }
      case 'ordini': {
        const data = await dal.getOrdini(tenantId);
        csv = ordiniToCSV(data);
        filename = 'ordini.csv';
        break;
      }
      case 'fatture': {
        const data = await dal.getFatture(tenantId);
        csv = fattureToCSV(data);
        filename = 'fatture.csv';
        break;
      }
      case 'prodotti': {
        const data = await dal.getProdotti(tenantId);
        csv = prodottiToCSV(data);
        filename = 'prodotti.csv';
        break;
      }
      case 'preventivi': {
        const data = await dal.getPreventivi(tenantId);
        csv = preventiviToCSV(data);
        filename = 'preventivi.csv';
        break;
      }
      case 'leads': {
        const data = await dal.getLeads(tenantId);
        csv = leadsToCSV(data);
        filename = 'leads.csv';
        break;
      }
      case 'spese': {
        const data = await dal.getSpese(tenantId);
        csv = speseToCSV(data);
        filename = 'spese.csv';
        break;
      }
      case 'dipendenti': {
        const data = await dal.getDipendenti(tenantId);
        csv = dipendentiToCSV(data);
        filename = 'dipendenti.csv';
        break;
      }
      case 'contratti': {
        const data = await dal.getContratti(tenantId);
        csv = contrattiToCSV(data);
        filename = 'contratti.csv';
        break;
      }
      case 'tickets': {
        const data = await dal.getTickets(tenantId);
        csv = ticketsToCSV(data);
        filename = 'tickets.csv';
        break;
      }
      default: {
        return NextResponse.json(
          { error: `Entità "${entity}" non supportata` },
          { status: 404 }
        );
      }
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`Errore export CSV ${entity}:`, error);
    return NextResponse.json(
      { error: 'Errore durante la generazione del CSV' },
      { status: 500 }
    );
  }
}
