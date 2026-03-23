import { NextRequest, NextResponse } from 'next/server';

// Cron job per aggiornamento stato fatture SDI.
// Configurare in vercel.json: schedule "ogni 15 minuti"
// Polling di backup per le notifiche webhook che potrebbero non arrivare.
// Controlla tutte le fatture con statoSDI in [inviata, in_attesa, consegnata].
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lazy imports per compatibilità Vercel build
  const dal = await import('@/lib/db/dal');
  const { getSDIProvider } = await import('@/lib/sdi/index');

  const fattureInAttesa = await dal.getFattureInAttesaSDI();

  let aggiornate = 0;
  let errori = 0;
  const results: { id: string; stato: string; aggiornato: boolean }[] = [];

  for (const fattura of fattureInAttesa) {
    try {
      if (!fattura.sdiIdentificativo || !fattura.sdiDataInvio) continue;

      // Salta fatture inviate meno di 30 secondi fa (dare tempo al provider)
      const elapsed = Date.now() - new Date(fattura.sdiDataInvio).getTime();
      if (elapsed < 30000) continue;

      // Carica config tenant
      const config = await dal.getConfigurazioneSdi(fattura.tenantId);
      const provider = getSDIProvider(config?.provider || 'simulato');

      const result = await provider.controllaStato(fattura.sdiIdentificativo, fattura.sdiDataInvio);

      // Aggiorna solo se lo stato è cambiato
      if (result.stato !== fattura.statoSDI) {
        const existingNotifiche = fattura.notificheSDI || [];
        const newNotifiche = result.notifiche.filter(n =>
          !existingNotifiche.some(existing => existing.tipo === n.tipo && existing.data === n.data)
        );

        const notificheSDI = [...existingNotifiche, ...newNotifiche];

        await dal.updateFatturaSDI(fattura.id, {
          statoSDI: result.stato,
          notificheSDI,
          sdiErroreDettaglio: result.erroreDettaglio || null,
        });

        await dal.createLogSdi({
          id: `log-sdi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fatturaId: fattura.id,
          tenantId: fattura.tenantId,
          azione: 'polling',
          stato: 'successo',
          dettagli: {
            statoPrecedente: fattura.statoSDI,
            statoNuovo: result.stato,
          },
          data: new Date().toISOString(),
        });

        aggiornate++;
        results.push({ id: fattura.id, stato: result.stato, aggiornato: true });
      } else {
        results.push({ id: fattura.id, stato: result.stato, aggiornato: false });
      }
    } catch (error) {
      errori++;
      console.error(`Cron SDI: errore per fattura ${fattura.id}:`, error);

      await dal.createLogSdi({
        id: `log-sdi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fatturaId: fattura.id,
        tenantId: fattura.tenantId,
        azione: 'polling',
        stato: 'errore',
        dettagli: { error: String(error) },
        data: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    totale: fattureInAttesa.length,
    aggiornate,
    errori,
    results,
  });
}
