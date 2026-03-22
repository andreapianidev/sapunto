import { Resend } from 'resend';

// Lazy initialization — env vars are not available at Vercel build time
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'Sapunto <noreply@sapunto.it>';
}

type EmailResult = { success: boolean; error?: string };

// ---------------------------------------------------------------------------
// Shared HTML layout
// ---------------------------------------------------------------------------

function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sapunto</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Sapunto</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                &copy; ${new Date().getFullYear()} Sapunto &mdash; Il gestionale per le PMI italiane.<br/>
                Questa email &egrave; stata inviata automaticamente, non rispondere a questo indirizzo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:600;">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">${text}</p>`;
}

function button(label: string, url: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:#2563eb;border-radius:8px;">
        <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 16px;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:40%;">${label}</td>
    <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:500;border-bottom:1px solid #f3f4f6;">${value}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    ${rows}
  </table>`;
}

// ---------------------------------------------------------------------------
// Email functions
// ---------------------------------------------------------------------------

/**
 * Welcome email sent after tenant signup.
 */
export async function sendWelcomeEmail(params: {
  to: string;
  nomeAzienda: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY non configurata.' };

  try {
    const html = emailLayout(`
      ${heading('Benvenuto su Sapunto!')}
      ${paragraph(`Ciao, il tuo account per <strong>${params.nomeAzienda}</strong> è stato creato con successo.`)}
      ${paragraph('Sapunto ti aiuterà a gestire la tua attività in modo semplice e veloce: clienti, ordini, fatture e molto altro, tutto in un unico posto.')}
      ${paragraph('Ecco cosa puoi fare subito:')}
      <ul style="margin:0 0 16px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
        <li>Configura i dati della tua azienda</li>
        <li>Aggiungi i tuoi primi clienti</li>
        <li>Crea il tuo primo ordine o preventivo</li>
      </ul>
      ${button('Accedi a Sapunto', 'https://app.sapunto.it')}
      ${paragraph('Se hai bisogno di assistenza non esitare a contattarci. Buon lavoro!')}
    `);

    await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: `Benvenuto su Sapunto, ${params.nomeAzienda}!`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto nell\'invio email.';
    console.error('[email] sendWelcomeEmail error:', message);
    return { success: false, error: message };
  }
}

/**
 * Password reset email.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY non configurata.' };

  try {
    const html = emailLayout(`
      ${heading('Reimposta la tua password')}
      ${paragraph('Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Sapunto.')}
      ${paragraph('Clicca sul pulsante qui sotto per scegliere una nuova password. Il link è valido per 60 minuti.')}
      ${button('Reimposta Password', params.resetUrl)}
      ${paragraph('Se non hai richiesto tu questa operazione puoi ignorare questa email. La tua password attuale rimarrà invariata.')}
      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;word-break:break-all;">
        Oppure copia e incolla questo link nel browser:<br/>${params.resetUrl}
      </p>
    `);

    await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: 'Reimposta la tua password — Sapunto',
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto nell\'invio email.';
    console.error('[email] sendPasswordResetEmail error:', message);
    return { success: false, error: message };
  }
}

/**
 * Payment confirmation email.
 */
export async function sendPaymentConfirmation(params: {
  to: string;
  pianoNome: string;
  importo: number;
  cicloPagamento: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY non configurata.' };

  try {
    const importoFormatted = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(params.importo);

    const html = emailLayout(`
      ${heading('Pagamento confermato')}
      ${paragraph('Grazie! Il tuo pagamento è stato ricevuto ed elaborato con successo.')}
      ${infoTable(`
        ${infoRow('Piano', params.pianoNome)}
        ${infoRow('Importo', importoFormatted)}
        ${infoRow('Ciclo di pagamento', params.cicloPagamento)}
        ${infoRow('Data', new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()))}
      `)}
      ${paragraph('Il tuo abbonamento è ora attivo. Puoi consultare lo storico dei pagamenti nella sezione <strong>Impostazioni &rarr; Abbonamento</strong> del tuo account.')}
      ${button('Vai al tuo account', 'https://app.sapunto.it/impostazioni/abbonamento')}
      ${paragraph('Grazie per aver scelto Sapunto!')}
    `);

    await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: `Conferma pagamento — Piano ${params.pianoNome}`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto nell\'invio email.';
    console.error('[email] sendPaymentConfirmation error:', message);
    return { success: false, error: message };
  }
}

/**
 * Ticket notification email (new ticket or status change).
 */
export async function sendTicketNotification(params: {
  to: string;
  ticketNumero: string;
  oggetto: string;
  stato: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY non configurata.' };

  try {
    const statoLabels: Record<string, string> = {
      aperto: 'Aperto',
      in_lavorazione: 'In lavorazione',
      risolto: 'Risolto',
      chiuso: 'Chiuso',
    };
    const statoColors: Record<string, string> = {
      aperto: '#2563eb',
      in_lavorazione: '#d97706',
      risolto: '#16a34a',
      chiuso: '#6b7280',
    };

    const statoLabel = statoLabels[params.stato] || params.stato;
    const statoColor = statoColors[params.stato] || '#2563eb';

    const html = emailLayout(`
      ${heading('Aggiornamento ticket')}
      ${paragraph(`Il ticket <strong>#${params.ticketNumero}</strong> è stato aggiornato.`)}
      ${infoTable(`
        ${infoRow('Numero', `#${params.ticketNumero}`)}
        ${infoRow('Oggetto', params.oggetto)}
        <tr>
          <td style="padding:10px 16px;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:40%;">Stato</td>
          <td style="padding:10px 16px;font-size:14px;border-bottom:1px solid #f3f4f6;">
            <span style="display:inline-block;padding:4px 12px;border-radius:9999px;background-color:${statoColor}20;color:${statoColor};font-weight:600;font-size:13px;">
              ${statoLabel}
            </span>
          </td>
        </tr>
      `)}
      ${paragraph('Puoi visualizzare i dettagli e rispondere direttamente dalla tua area assistenza.')}
      ${button('Visualizza Ticket', `https://app.sapunto.it/assistenza/ticket/${params.ticketNumero}`)}
    `);

    await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: `Ticket #${params.ticketNumero} — ${statoLabel}`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto nell\'invio email.';
    console.error('[email] sendTicketNotification error:', message);
    return { success: false, error: message };
  }
}

/**
 * Invoice email, optionally with a PDF attachment link.
 */
export async function sendInvoiceEmail(params: {
  to: string;
  fatturaNumero: string;
  importo: number;
  pdfUrl?: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) return { success: false, error: 'RESEND_API_KEY non configurata.' };

  try {
    const importoFormatted = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(params.importo);

    const pdfSection = params.pdfUrl
      ? button('Scarica PDF Fattura', params.pdfUrl)
      : '';

    const html = emailLayout(`
      ${heading('Nuova fattura disponibile')}
      ${paragraph(`È stata emessa una nuova fattura per il tuo account.`)}
      ${infoTable(`
        ${infoRow('Numero fattura', params.fatturaNumero)}
        ${infoRow('Importo', importoFormatted)}
        ${infoRow('Data emissione', new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()))}
      `)}
      ${pdfSection}
      ${paragraph('Puoi consultare tutte le tue fatture nella sezione <strong>Impostazioni &rarr; Fatturazione</strong> del tuo account Sapunto.')}
      ${button('Vai alle fatture', 'https://app.sapunto.it/impostazioni/fatturazione')}
    `);

    await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: `Fattura ${params.fatturaNumero} — Sapunto`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto nell\'invio email.';
    console.error('[email] sendInvoiceEmail error:', message);
    return { success: false, error: message };
  }
}
