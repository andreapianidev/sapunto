CREATE TYPE "public"."canale_ordine" AS ENUM('diretto', 'woocommerce', 'prestashop', 'telefono', 'email');--> statement-breakpoint
CREATE TYPE "public"."categoria_spesa" AS ENUM('trasporti', 'pasti', 'alloggio', 'materiali', 'servizi', 'utenze', 'altro');--> statement-breakpoint
CREATE TYPE "public"."fase_lead" AS ENUM('nuovo', 'contattato', 'qualificato', 'proposta', 'negoziazione', 'vinto', 'perso');--> statement-breakpoint
CREATE TYPE "public"."fonte_lead" AS ENUM('sito_web', 'referral', 'fiera', 'social', 'cold_call', 'altro');--> statement-breakpoint
CREATE TYPE "public"."piano_abbonamento" AS ENUM('base', 'professional', 'premium');--> statement-breakpoint
CREATE TYPE "public"."piattaforma_ecommerce" AS ENUM('woocommerce', 'prestashop', 'shopify');--> statement-breakpoint
CREATE TYPE "public"."priorita_task" AS ENUM('bassa', 'media', 'alta', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."priorita_ticket" AS ENUM('bassa', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."rinnovo_contratto" AS ENUM('automatico', 'manuale');--> statement-breakpoint
CREATE TYPE "public"."stato_appuntamento" AS ENUM('confermato', 'in_attesa', 'annullato');--> statement-breakpoint
CREATE TYPE "public"."stato_contratto" AS ENUM('bozza', 'attivo', 'scaduto', 'rinnovato', 'rescisso');--> statement-breakpoint
CREATE TYPE "public"."stato_integrazione" AS ENUM('attivo', 'disattivo', 'errore', 'prossimamente');--> statement-breakpoint
CREATE TYPE "public"."stato_log_sync" AS ENUM('successo', 'errore', 'conflitto');--> statement-breakpoint
CREATE TYPE "public"."stato_nota_credito" AS ENUM('emessa', 'inviata_sdi', 'accettata');--> statement-breakpoint
CREATE TYPE "public"."stato_ordine" AS ENUM('nuovo', 'in_lavorazione', 'spedito', 'completato', 'annullato');--> statement-breakpoint
CREATE TYPE "public"."stato_pagamento" AS ENUM('pagata', 'non_pagata', 'scaduta', 'parziale');--> statement-breakpoint
CREATE TYPE "public"."stato_preventivo" AS ENUM('bozza', 'inviato', 'accettato', 'rifiutato', 'scaduto');--> statement-breakpoint
CREATE TYPE "public"."stato_progetto" AS ENUM('pianificato', 'in_corso', 'in_pausa', 'completato', 'annullato');--> statement-breakpoint
CREATE TYPE "public"."stato_sdi" AS ENUM('bozza', 'inviata', 'consegnata', 'scartata', 'in_attesa', 'accettata', 'rifiutata');--> statement-breakpoint
CREATE TYPE "public"."stato_spesa" AS ENUM('da_approvare', 'approvata', 'rifiutata', 'rimborsata');--> statement-breakpoint
CREATE TYPE "public"."stato_task" AS ENUM('da_fare', 'in_corso', 'in_revisione', 'completato');--> statement-breakpoint
CREATE TYPE "public"."stato_tenant" AS ENUM('attivo', 'sospeso', 'trial');--> statement-breakpoint
CREATE TYPE "public"."stato_ticket" AS ENUM('aperto', 'in_lavorazione', 'in_attesa', 'risolto', 'chiuso');--> statement-breakpoint
CREATE TYPE "public"."tipo_cliente" AS ENUM('azienda', 'privato');--> statement-breakpoint
CREATE TYPE "public"."tipo_contratto" AS ENUM('servizio', 'fornitura', 'manutenzione', 'consulenza', 'altro');--> statement-breakpoint
CREATE TYPE "public"."tipo_contratto_lavoro" AS ENUM('indeterminato', 'determinato', 'apprendistato', 'collaborazione');--> statement-breakpoint
CREATE TYPE "public"."tipo_email" AS ENUM('ricevuta', 'inviata', 'bozza');--> statement-breakpoint
CREATE TYPE "public"."tipo_fattura" AS ENUM('emessa', 'ricevuta');--> statement-breakpoint
CREATE TYPE "public"."tipo_log_sync" AS ENUM('ordine', 'prodotto', 'cliente', 'inventario');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimento" AS ENUM('carico', 'scarico');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'tenant_admin', 'utente');--> statement-breakpoint
CREATE TABLE "appuntamenti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"titolo" text NOT NULL,
	"cliente_id" text,
	"cliente_nome" text,
	"operatore_id" text NOT NULL,
	"operatore_nome" text NOT NULL,
	"data" text NOT NULL,
	"ora_inizio" text NOT NULL,
	"ora_fine" text NOT NULL,
	"stato" "stato_appuntamento" NOT NULL,
	"luogo" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "cedolini" (
	"id" text PRIMARY KEY NOT NULL,
	"dipendente_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"mese" integer NOT NULL,
	"anno" integer NOT NULL,
	"lordo" numeric(10, 2) NOT NULL,
	"contributi_inps" numeric(10, 2) NOT NULL,
	"irpef" numeric(10, 2) NOT NULL,
	"addizionale_regionale" numeric(10, 2) NOT NULL,
	"addizionale_comunale" numeric(10, 2) NOT NULL,
	"altre_ritenute" numeric(10, 2) NOT NULL,
	"netto" numeric(10, 2) NOT NULL,
	"data_emissione" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clienti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"ragione_sociale" text NOT NULL,
	"partita_iva" text NOT NULL,
	"codice_fiscale" text NOT NULL,
	"indirizzo" text NOT NULL,
	"citta" text NOT NULL,
	"cap" text NOT NULL,
	"provincia" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"pec" text,
	"codice_destinatario" text,
	"tipo" "tipo_cliente" NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text,
	"data_creazione" text NOT NULL,
	"referente" text
);
--> statement-breakpoint
CREATE TABLE "contratti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" text NOT NULL,
	"cliente_nome" text NOT NULL,
	"oggetto" text NOT NULL,
	"tipo" "tipo_contratto" NOT NULL,
	"stato" "stato_contratto" NOT NULL,
	"data_inizio" text NOT NULL,
	"data_fine" text NOT NULL,
	"valore_annuale" numeric(10, 2) NOT NULL,
	"rinnovo" "rinnovo_contratto" NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "dipendenti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"codice_fiscale" text NOT NULL,
	"data_nascita" text NOT NULL,
	"luogo_nascita" text NOT NULL,
	"indirizzo" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"ruolo_aziendale" text NOT NULL,
	"tipo_contratto" "tipo_contratto_lavoro" NOT NULL,
	"data_assunzione" text NOT NULL,
	"ral_lorda" numeric(10, 2) NOT NULL,
	"livello" text NOT NULL,
	"iban" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"da" text NOT NULL,
	"a" text NOT NULL,
	"oggetto" text NOT NULL,
	"corpo" text NOT NULL,
	"data" text NOT NULL,
	"letto" boolean DEFAULT false NOT NULL,
	"cliente_id" text,
	"cliente_nome" text,
	"tipo" "tipo_email" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fatture" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"numero" text NOT NULL,
	"tipo" "tipo_fattura" NOT NULL,
	"cliente_id" text NOT NULL,
	"cliente_nome" text NOT NULL,
	"data" text NOT NULL,
	"data_scadenza" text NOT NULL,
	"stato" "stato_pagamento" NOT NULL,
	"stato_sdi" "stato_sdi" NOT NULL,
	"notifiche_sdi" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ordine_id" text,
	"righe" jsonb NOT NULL,
	"subtotale" numeric(10, 2) NOT NULL,
	"iva" numeric(10, 2) NOT NULL,
	"totale" numeric(10, 2) NOT NULL,
	"xml_riferimento" text
);
--> statement-breakpoint
CREATE TABLE "integrazioni_ecommerce" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"piattaforma" "piattaforma_ecommerce" NOT NULL,
	"stato" "stato_integrazione" NOT NULL,
	"url_negozio" text,
	"ultimo_sync" text,
	"ordini_sincronizzati" integer DEFAULT 0 NOT NULL,
	"prodotti_mappati" integer DEFAULT 0 NOT NULL,
	"errori" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"azienda" text NOT NULL,
	"referente" text NOT NULL,
	"email" text NOT NULL,
	"telefono" text NOT NULL,
	"fonte" "fonte_lead" NOT NULL,
	"fase" "fase_lead" NOT NULL,
	"valore" numeric(10, 2) NOT NULL,
	"probabilita" integer NOT NULL,
	"assegnato_a" text NOT NULL,
	"assegnato_nome" text NOT NULL,
	"data_creazione" text NOT NULL,
	"data_chiusura_prevista" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "log_sync" (
	"id" text PRIMARY KEY NOT NULL,
	"integrazione_id" text NOT NULL,
	"data" text NOT NULL,
	"tipo" "tipo_log_sync" NOT NULL,
	"stato" "stato_log_sync" NOT NULL,
	"messaggio" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movimenti_magazzino" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"prodotto_id" text NOT NULL,
	"prodotto_nome" text NOT NULL,
	"tipo" "tipo_movimento" NOT NULL,
	"quantita" integer NOT NULL,
	"data" text NOT NULL,
	"motivo" text NOT NULL,
	"ordine_id" text
);
--> statement-breakpoint
CREATE TABLE "note_di_credito" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"numero" text NOT NULL,
	"fattura_id" text NOT NULL,
	"fattura_numero" text NOT NULL,
	"cliente_id" text NOT NULL,
	"cliente_nome" text NOT NULL,
	"data" text NOT NULL,
	"motivo" text NOT NULL,
	"importo" numeric(10, 2) NOT NULL,
	"iva" numeric(10, 2) NOT NULL,
	"totale" numeric(10, 2) NOT NULL,
	"stato" "stato_nota_credito" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordini" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" text NOT NULL,
	"cliente_nome" text NOT NULL,
	"data" text NOT NULL,
	"stato" "stato_ordine" NOT NULL,
	"righe" jsonb NOT NULL,
	"subtotale" numeric(10, 2) NOT NULL,
	"iva" numeric(10, 2) NOT NULL,
	"totale" numeric(10, 2) NOT NULL,
	"canale" "canale_ordine" NOT NULL,
	"note" text,
	"fattura_id" text
);
--> statement-breakpoint
CREATE TABLE "piani" (
	"id" "piano_abbonamento" PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"prezzo_mensile" numeric(10, 2) NOT NULL,
	"prezzo_annuale" numeric(10, 2) NOT NULL,
	"max_utenti" integer NOT NULL,
	"max_clienti" integer NOT NULL,
	"max_fatture" integer NOT NULL,
	"funzionalita" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preventivi" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" text NOT NULL,
	"cliente_nome" text NOT NULL,
	"data" text NOT NULL,
	"data_scadenza" text NOT NULL,
	"stato" "stato_preventivo" NOT NULL,
	"oggetto" text NOT NULL,
	"righe" jsonb NOT NULL,
	"subtotale" numeric(10, 2) NOT NULL,
	"iva" numeric(10, 2) NOT NULL,
	"totale" numeric(10, 2) NOT NULL,
	"note" text,
	"ordine_id" text
);
--> statement-breakpoint
CREATE TABLE "prodotti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"nome" text NOT NULL,
	"sku" text NOT NULL,
	"descrizione" text NOT NULL,
	"prezzo" numeric(10, 2) NOT NULL,
	"prezzo_acquisto" numeric(10, 2) NOT NULL,
	"giacenza" integer NOT NULL,
	"scorte_minime" integer NOT NULL,
	"categoria" text NOT NULL,
	"unita" text NOT NULL,
	"iva" integer NOT NULL,
	"attivo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progetti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"nome" text NOT NULL,
	"cliente_id" text,
	"cliente_nome" text,
	"stato" "stato_progetto" NOT NULL,
	"data_inizio" text NOT NULL,
	"data_fine_prevista" text NOT NULL,
	"budget" numeric(10, 2),
	"descrizione" text NOT NULL,
	"responsabile_id" text NOT NULL,
	"responsabile_nome" text NOT NULL,
	"completamento" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spese" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"descrizione" text NOT NULL,
	"categoria" "categoria_spesa" NOT NULL,
	"importo" numeric(10, 2) NOT NULL,
	"data" text NOT NULL,
	"dipendente_id" text,
	"dipendente_nome" text,
	"cliente_id" text,
	"cliente_nome" text,
	"progetto_id" text,
	"progetto_nome" text,
	"stato" "stato_spesa" NOT NULL,
	"ricevuta" boolean,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"progetto_id" text NOT NULL,
	"titolo" text NOT NULL,
	"descrizione" text,
	"stato" "stato_task" NOT NULL,
	"priorita" "priorita_task" NOT NULL,
	"assegnato_a" text NOT NULL,
	"assegnato_nome" text NOT NULL,
	"data_scadenza" text NOT NULL,
	"ore_stimate" integer,
	"ore_effettive" integer
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"ragione_sociale" text NOT NULL,
	"partita_iva" text NOT NULL,
	"codice_fiscale" text NOT NULL,
	"indirizzo" text NOT NULL,
	"citta" text NOT NULL,
	"cap" text NOT NULL,
	"provincia" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"pec" text NOT NULL,
	"codice_destinatario" text NOT NULL,
	"logo" text,
	"piano" "piano_abbonamento" NOT NULL,
	"stato" "stato_tenant" NOT NULL,
	"data_creazione" text NOT NULL,
	"data_scadenza" text NOT NULL,
	"max_utenti" integer NOT NULL,
	"utenti_attivi" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" text,
	"cliente_nome" text,
	"oggetto" text NOT NULL,
	"descrizione" text NOT NULL,
	"priorita" "priorita_ticket" NOT NULL,
	"stato" "stato_ticket" NOT NULL,
	"categoria" text NOT NULL,
	"assegnato_a" text,
	"assegnato_nome" text,
	"data_apertura" text NOT NULL,
	"data_chiusura" text,
	"risposte" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"nome" text NOT NULL,
	"cognome" text NOT NULL,
	"email" text NOT NULL,
	"ruolo" "user_role" NOT NULL,
	"avatar" text,
	"attivo" boolean DEFAULT true NOT NULL
);
