'use client';

import Link from 'next/link';
import { ArrowLeft, XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pagamento annullato</h1>
          <p className="text-slate-500 mb-6">
            Il pagamento è stato annullato. Non ti è stato addebitato nulla.
            Puoi riprovare quando vuoi.
          </p>
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Torna al checkout
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
