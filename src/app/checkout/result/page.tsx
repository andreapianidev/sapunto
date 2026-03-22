'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { capturePayPalPayment } from '@/lib/actions/payments';

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    }>
      <CheckoutResultContent />
    </Suspense>
  );
}

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const orderId = searchParams.get('orderId');
  const abbonamentoId = searchParams.get('abbonamentoId');
  const paypalToken = searchParams.get('token'); // PayPal invia il token come query param

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function processResult() {
      if (provider === 'paypal' && paypalToken && orderId) {
        // Cattura il pagamento PayPal
        try {
          const result = await capturePayPalPayment(paypalToken, orderId);
          if (result.success) {
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMessage(result.error || 'Errore durante la conferma del pagamento');
          }
        } catch {
          setStatus('error');
          setErrorMessage('Errore durante la conferma del pagamento PayPal');
        }
      } else {
        // Per Nexi, il webhook gestisce la conferma.
        // Qui mostriamo un messaggio di successo generico.
        setStatus('success');
      }
    }

    processResult();
  }, [provider, paypalToken, orderId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Conferma pagamento in corso...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Pagamento non riuscito</h1>
            <p className="text-slate-500 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
              >
                Riprova
              </Link>
              <Link
                href="/"
                className="block w-full py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center"
              >
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pagamento completato!</h1>
          <p className="text-slate-500 mb-6">
            Il tuo abbonamento Sapunto è stato attivato con successo.
            Riceverai una email di conferma con i dettagli di accesso.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-center"
            >
              Vai alla Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center"
            >
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
