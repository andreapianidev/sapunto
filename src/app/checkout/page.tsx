'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard, Building2, Check, ArrowLeft, Shield, Lock,
  FileText, ShoppingCart, Rocket, Minus, Plus, Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchPiani } from '@/lib/actions/data';
import { iniziaCheckout, fetchMetodiPagamentoDisponibili, fetchInfoBonifico } from '@/lib/actions/payments';
import type { PianoAbbonamento, CicloPagamento, MetodoPagamentoPiattaforma, PianoConfig } from '@/lib/types';

const pianoIcons: Record<string, typeof FileText> = {
  express: FileText,
  explore: ShoppingCart,
  experience: Rocket,
};

const pianoColors: Record<string, string> = {
  express: 'from-emerald-500 to-teal-600',
  explore: 'from-blue-500 to-indigo-600',
  experience: 'from-violet-500 to-purple-600',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const pianoParam = searchParams.get('piano') as PianoAbbonamento | null;

  const [piani, setPiani] = useState<PianoConfig[]>([]);
  const [selectedPiano, setSelectedPiano] = useState<PianoAbbonamento>(pianoParam || 'explore');
  const [cicloPagamento, setCicloPagamento] = useState<CicloPagamento>('mensile');
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamentoPiattaforma | null>(null);
  const [utentiAggiuntivi, setUtentiAggiuntivi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metodiDisponibili, setMetodiDisponibili] = useState({ nexi: false, paypal: false, bonifico: false });
  const [bonificoInfo, setBonificoInfo] = useState<{ iban: string; intestatario: string; banca: string; causale: string; importo: number } | null>(null);

  useEffect(() => {
    async function load() {
      const [pianiData, metodi] = await Promise.all([
        fetchPiani(),
        fetchMetodiPagamentoDisponibili(),
      ]);
      setPiani(pianiData);
      setMetodiDisponibili(metodi);
      setLoading(false);
    }
    load();
  }, []);

  const piano = piani.find(p => p.id === selectedPiano);
  const importoBase = piano
    ? (cicloPagamento === 'mensile' ? piano.prezzoMensile : piano.prezzoAnnuale)
    : 0;
  const costoUtentiAgg = utentiAggiuntivi * 19;
  const importoTotale = importoBase + costoUtentiAgg;

  const handleCheckout = async () => {
    if (!metodoPagamento || !piano) return;
    setProcessing(true);
    setError(null);

    try {
      // Per demo, usiamo un tenant ID fittizio. In produzione sarà legato alla sessione.
      const tenantId = `t-new-${crypto.randomUUID().slice(0, 8)}`;

      const result = await iniziaCheckout({
        tenantId,
        pianoId: selectedPiano,
        cicloPagamento,
        metodoPagamento,
        utentiAggiuntivi,
      });

      if (!result.success) {
        setError(result.error || 'Errore durante il checkout');
        setProcessing(false);
        return;
      }

      if (result.redirectUrl) {
        // Redirect al gateway di pagamento
        window.location.href = result.redirectUrl;
      } else if (result.bonificoInfo) {
        // Mostra dettagli bonifico
        setBonificoInfo(result.bonificoInfo);
        setProcessing(false);
      }
    } catch {
      setError('Errore imprevisto. Riprova più tardi.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Vista dettagli bonifico
  if (bonificoInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Pagamento tramite Bonifico</h1>
              <p className="text-slate-500 mt-2">
                Effettua il bonifico con i seguenti dati. L&apos;abbonamento sarà attivato dopo la conferma del pagamento.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 rounded-xl p-6">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Intestatario</span>
                <span className="font-semibold text-slate-900">{bonificoInfo.intestatario || 'Da configurare'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">IBAN</span>
                <span className="font-mono font-semibold text-slate-900">{bonificoInfo.iban || 'Da configurare'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Banca</span>
                <span className="font-semibold text-slate-900">{bonificoInfo.banca || 'Da configurare'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Causale</span>
                <span className="font-semibold text-slate-900 text-right">{bonificoInfo.causale}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Importo</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(bonificoInfo.importo)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Inserisci la causale esattamente come indicata per velocizzare la conferma.
                Riceverai una email di conferma una volta verificato il pagamento.
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Torna al sito
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm text-slate-500">Pagamento Sicuro</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Scegli il tuo piano Sapunto</h1>
          <p className="text-slate-500 mt-2">Inizia la tua prova gratuita di 14 giorni, poi scegli come pagare</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonna 1: Selezione Piano */}
          <div className="lg:col-span-2 space-y-6">

            {/* Piano Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">1. Scegli il piano</h2>
              <div className="grid gap-3">
                {piani.map((p) => {
                  const Icon = pianoIcons[p.id] || FileText;
                  const isSelected = selectedPiano === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPiano(p.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pianoColors[p.id]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{p.nome}</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(p.id === 'express' ? p.prezzoAnnuale : p.prezzoMensile)}
                            <span className="text-sm font-normal text-slate-500">
                              {p.id === 'express' ? '/anno' : '/mese'}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{p.descrizione}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ciclo Pagamento */}
            {selectedPiano !== 'express' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">2. Frequenza di pagamento</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCicloPagamento('mensile')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      cicloPagamento === 'mensile'
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">Mensile</div>
                    <div className="text-sm text-slate-500">Paghi ogni mese</div>
                  </button>
                  <button
                    onClick={() => setCicloPagamento('annuale')}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      cicloPagamento === 'annuale'
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -17%
                    </div>
                    <div className="font-semibold text-slate-900">Annuale</div>
                    <div className="text-sm text-slate-500">Risparmia 2 mesi</div>
                  </button>
                </div>
              </div>
            )}

            {/* Utenti Aggiuntivi */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {selectedPiano !== 'express' ? '3' : '2'}. Utenti aggiuntivi
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                1 utente incluso nel piano. Ogni utente aggiuntivo costa {formatCurrency(19)}/mese.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setUtentiAggiuntivi(Math.max(0, utentiAggiuntivi - 1))}
                  disabled={utentiAggiuntivi === 0}
                  className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{utentiAggiuntivi}</div>
                  <div className="text-xs text-slate-500">utenti extra</div>
                </div>
                <button
                  onClick={() => setUtentiAggiuntivi(utentiAggiuntivi + 1)}
                  className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {utentiAggiuntivi > 0 && (
                  <div className="ml-4 text-sm text-slate-500">
                    +{formatCurrency(costoUtentiAgg)}/mese
                  </div>
                )}
              </div>
            </div>

            {/* Metodo di Pagamento */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {selectedPiano !== 'express' ? '4' : '3'}. Metodo di pagamento
              </h2>
              <div className="space-y-3">
                {/* NexiPay */}
                <button
                  onClick={() => setMetodoPagamento('nexi')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    metodoPagamento === 'nexi'
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Carta di Credito / Debito</div>
                    <div className="text-sm text-slate-500">Visa, Mastercard, Maestro via NexiPay</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    metodoPagamento === 'nexi' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {metodoPagamento === 'nexi' && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setMetodoPagamento('paypal')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    metodoPagamento === 'paypal'
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#003087] to-[#009cde] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">PayPal</div>
                    <div className="text-sm text-slate-500">Paga con il tuo conto PayPal</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    metodoPagamento === 'paypal' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {metodoPagamento === 'paypal' && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>

                {/* Bonifico */}
                <button
                  onClick={() => setMetodoPagamento('bonifico')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    metodoPagamento === 'bonifico'
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Bonifico Bancario</div>
                    <div className="text-sm text-slate-500">Attivazione dopo conferma ricezione</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    metodoPagamento === 'bonifico' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {metodoPagamento === 'bonifico' && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Colonna 2: Riepilogo Ordine */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Riepilogo</h2>

              {piano && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pianoColors[piano.id]} flex items-center justify-center`}>
                      {(() => { const Icon = pianoIcons[piano.id] || FileText; return <Icon className="h-5 w-5 text-white" />; })()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Sapunto {piano.nome}</div>
                      <div className="text-sm text-slate-500">
                        {cicloPagamento === 'mensile' ? 'Abbonamento mensile' : 'Abbonamento annuale'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Piano {piano.nome}</span>
                      <span className="text-slate-900">
                        {formatCurrency(importoBase)}
                        <span className="text-slate-400">/{cicloPagamento === 'mensile' ? 'mese' : 'anno'}</span>
                      </span>
                    </div>
                    {utentiAggiuntivi > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">{utentiAggiuntivi} utent{utentiAggiuntivi === 1 ? 'e' : 'i'} aggiuntiv{utentiAggiuntivi === 1 ? 'o' : 'i'}</span>
                        <span className="text-slate-900">{formatCurrency(costoUtentiAgg)}/mese</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Utenti totali</span>
                      <span className="text-slate-900">{1 + utentiAggiuntivi}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-900 font-semibold">Totale</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(importoTotale)}</span>
                        <span className="text-sm text-slate-500 block">
                          /{cicloPagamento === 'mensile' ? 'mese' : 'anno'} + IVA
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={!metodoPagamento || processing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Elaborazione...
                      </>
                    ) : metodoPagamento === 'bonifico' ? (
                      'Mostra dati per bonifico'
                    ) : (
                      'Procedi al pagamento'
                    )}
                  </button>

                  <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Pagamento sicuro e criptato</span>
                  </div>

                  {/* Feature list */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Include:</p>
                    {piano.funzionalita.slice(0, 6).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {piano.funzionalita.length > 6 && (
                      <p className="text-xs text-slate-400">+ altre {piano.funzionalita.length - 6} funzionalità</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
