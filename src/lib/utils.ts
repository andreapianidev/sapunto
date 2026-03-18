import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formattazione valuta italiana: € 1.234,56
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Formattazione data italiana: dd/mm/yyyy
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Formattazione data e ora
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Formattazione P.IVA: IT 01234567890
export function formatPIVA(piva: string): string {
  const clean = piva.replace(/\s/g, '');
  if (clean.startsWith('IT')) {
    return `IT ${clean.slice(2)}`;
  }
  return `IT ${clean}`;
}

// Formattazione numero con separatori italiani
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('it-IT').format(n);
}

// Abbreviazione valuta: € 1.2K, € 45.3K, € 1.2M
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `€ ${(amount / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (amount >= 1_000) {
    return `€ ${(amount / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return formatCurrency(amount);
}

// Colore stato ordine
export function getStatoOrdineColor(stato: string): string {
  const colors: Record<string, string> = {
    nuovo: 'bg-blue-100 text-blue-800',
    in_lavorazione: 'bg-yellow-100 text-yellow-800',
    spedito: 'bg-purple-100 text-purple-800',
    completato: 'bg-green-100 text-green-800',
    annullato: 'bg-red-100 text-red-800',
  };
  return colors[stato] || 'bg-gray-100 text-gray-800';
}

// Label stato ordine
export function getStatoOrdineLabel(stato: string): string {
  const labels: Record<string, string> = {
    nuovo: 'Nuovo',
    in_lavorazione: 'In Lavorazione',
    spedito: 'Spedito',
    completato: 'Completato',
    annullato: 'Annullato',
  };
  return labels[stato] || stato;
}

// Colore stato SDI
export function getStatoSDIColor(stato: string): string {
  const colors: Record<string, string> = {
    bozza: 'bg-gray-100 text-gray-800',
    inviata: 'bg-blue-100 text-blue-800',
    consegnata: 'bg-green-100 text-green-800',
    scartata: 'bg-red-100 text-red-800',
    in_attesa: 'bg-yellow-100 text-yellow-800',
    accettata: 'bg-emerald-100 text-emerald-800',
    rifiutata: 'bg-red-100 text-red-800',
  };
  return colors[stato] || 'bg-gray-100 text-gray-800';
}

// Label stato SDI
export function getStatoSDILabel(stato: string): string {
  const labels: Record<string, string> = {
    bozza: 'Bozza',
    inviata: 'Inviata',
    consegnata: 'Consegnata',
    scartata: 'Scartata',
    in_attesa: 'In Attesa',
    accettata: 'Accettata',
    rifiutata: 'Rifiutata',
  };
  return labels[stato] || stato;
}

// Colore stato fattura pagamento
export function getStatoPagamentoColor(stato: string): string {
  const colors: Record<string, string> = {
    pagata: 'bg-green-100 text-green-800',
    non_pagata: 'bg-yellow-100 text-yellow-800',
    scaduta: 'bg-red-100 text-red-800',
    parziale: 'bg-orange-100 text-orange-800',
  };
  return colors[stato] || 'bg-gray-100 text-gray-800';
}

// Iniziali per avatar
export function getInitials(nome: string, cognome: string): string {
  return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
}

// Mese in italiano
export function getMeseLabel(mese: number): string {
  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return mesi[mese - 1] || '';
}
