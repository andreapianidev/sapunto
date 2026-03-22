import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job per rinnovi automatici abbonamenti.
 * Configurare in vercel.json: { "crons": [{ "path": "/api/cron/rinnovi", "schedule": "0 6 * * *" }] }
 * Runs daily at 6 AM.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lazy imports per compatibilita' Vercel build
  const dal = await import('@/lib/db/dal');
  const { nexiClient } = await import('@/lib/payments/nexi');
  const { generateOrderId } = await import('@/lib/payments');

  const now = new Date();
  const allAbbonamenti = await dal.getAbbonamenti();

  // Find subscriptions due for renewal
  const daRinnovare = allAbbonamenti.filter((abb) => {
    if (abb.stato !== 'attivo') return false;
    if (!abb.prossimoRinnovo) return false;
    return new Date(abb.prossimoRinnovo) <= now;
  });

  let rinnovati = 0;
  let falliti = 0;
  const errors: string[] = [];

  for (const abb of daRinnovare) {
    try {
      if (
        abb.metodoPagamento === 'nexi' &&
        abb.nexiContractId &&
        nexiClient.isConfigured
      ) {
        // Process Nexi MIT payment
        const orderId = generateOrderId();
        const pianiData = await dal.getPiani();
        const piano = pianiData.find((p) => p.id === abb.pianoId);

        const mitRequest = nexiClient.buildRenewalRequest({
          orderId,
          amount: abb.importoTotale,
          contractId: abb.nexiContractId,
          pianoNome: piano?.nome || abb.pianoId,
        });

        const result = await nexiClient.createMitPayment(mitRequest);

        if (
          result.operation.operationResult === 'AUTHORIZED' ||
          result.operation.operationResult === 'EXECUTED'
        ) {
          // Create transaction record
          await dal.createTransazione({
            id: `trx-${crypto.randomUUID().slice(0, 8)}`,
            abbonamentoId: abb.id,
            tenantId: abb.tenantId,
            importo: abb.importoTotale.toString(),
            valuta: 'EUR',
            stato: 'completata',
            metodoPagamento: 'nexi',
            riferimentoEsterno: orderId,
            nexiOperationId: result.operation.operationId,
            descrizione: `Rinnovo ${piano?.nome || abb.pianoId}`,
            data: now.toISOString(),
            dataConferma: now.toISOString(),
          });

          // Update subscription next renewal
          const nextRenewal = new Date(now);
          if (abb.cicloPagamento === 'mensile') {
            nextRenewal.setMonth(nextRenewal.getMonth() + 1);
          } else {
            nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
          }

          await dal.updateAbbonamento(abb.id, {
            prossimoRinnovo: nextRenewal.toISOString(),
            dataFine: nextRenewal.toISOString(),
          });

          rinnovati++;
        } else {
          falliti++;
          errors.push(
            `Nexi MIT failed for tenant ${abb.tenantId}: ${result.operation.operationResult}`
          );
        }
      } else if (
        abb.metodoPagamento === 'paypal' &&
        abb.paypalSubscriptionId
      ) {
        // PayPal subscriptions are handled automatically by PayPal
        // Just check status and update
        const { paypalClient } = await import('@/lib/payments/paypal');
        if (paypalClient.isConfigured) {
          const details = await paypalClient.getSubscriptionDetails(
            abb.paypalSubscriptionId
          );
          if (details.status === 'ACTIVE') {
            const nextRenewal = new Date(now);
            if (abb.cicloPagamento === 'mensile') {
              nextRenewal.setMonth(nextRenewal.getMonth() + 1);
            } else {
              nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
            }

            await dal.updateAbbonamento(abb.id, {
              prossimoRinnovo: nextRenewal.toISOString(),
              dataFine: nextRenewal.toISOString(),
            });
            rinnovati++;
          } else if (
            details.status === 'CANCELLED' ||
            details.status === 'SUSPENDED' ||
            details.status === 'EXPIRED'
          ) {
            await dal.updateAbbonamento(abb.id, { stato: 'scaduto' });
            await dal.updateTenantPiano(
              abb.tenantId,
              abb.pianoId,
              'sospeso'
            );
            falliti++;
            errors.push(
              `PayPal subscription ${details.status} for tenant ${abb.tenantId}`
            );
          }
        }
      } else if (abb.metodoPagamento === 'bonifico') {
        // For bank transfers, just mark as expired if past due
        await dal.updateAbbonamento(abb.id, { stato: 'scaduto' });
        await dal.updateTenantPiano(abb.tenantId, abb.pianoId, 'sospeso');
        falliti++;
        errors.push(`Bonifico scaduto per tenant ${abb.tenantId}`);
      }
    } catch (error) {
      falliti++;
      errors.push(
        `Error processing ${abb.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return NextResponse.json({
    processed: daRinnovare.length,
    rinnovati,
    falliti,
    errors: errors.length > 0 ? errors : undefined,
  });
}
