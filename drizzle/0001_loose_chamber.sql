CREATE TYPE "public"."ciclo_pagamento" AS ENUM('mensile', 'annuale');--> statement-breakpoint
CREATE TYPE "public"."metodo_pagamento_piattaforma" AS ENUM('nexi', 'paypal', 'bonifico');--> statement-breakpoint
CREATE TYPE "public"."stato_abbonamento" AS ENUM('attivo', 'scaduto', 'sospeso', 'cancellato', 'trial', 'in_attesa_pagamento');--> statement-breakpoint
CREATE TYPE "public"."stato_transazione" AS ENUM('pending', 'completata', 'fallita', 'rimborsata', 'in_attesa_conferma');--> statement-breakpoint
CREATE TABLE "abbonamenti" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"piano_id" "piano_abbonamento" NOT NULL,
	"stato" "stato_abbonamento" NOT NULL,
	"metodo_pagamento" "metodo_pagamento_piattaforma",
	"ciclo_pagamento" "ciclo_pagamento" NOT NULL,
	"data_inizio" text NOT NULL,
	"data_fine" text NOT NULL,
	"prossimo_rinnovo" text,
	"nexi_contract_id" text,
	"paypal_subscription_id" text,
	"importo_base" numeric(10, 2) NOT NULL,
	"utenti_aggiuntivi" integer DEFAULT 0 NOT NULL,
	"costo_utenti_aggiuntivi" numeric(10, 2) DEFAULT '0' NOT NULL,
	"importo_totale" numeric(10, 2) NOT NULL,
	"riferimento_bonifico" text,
	"note" text,
	"data_creazione" text NOT NULL,
	"data_aggiornamento" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transazioni_piattaforma" (
	"id" text PRIMARY KEY NOT NULL,
	"abbonamento_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"importo" numeric(10, 2) NOT NULL,
	"valuta" text DEFAULT 'EUR' NOT NULL,
	"stato" "stato_transazione" NOT NULL,
	"metodo_pagamento" "metodo_pagamento_piattaforma" NOT NULL,
	"riferimento_esterno" text,
	"nexi_operation_id" text,
	"paypal_transaction_id" text,
	"descrizione" text NOT NULL,
	"data" text NOT NULL,
	"data_conferma" text,
	"dettagli_risposta" jsonb
);
--> statement-breakpoint
ALTER TABLE "abbonamenti" ALTER COLUMN "piano_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "piani" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "piano" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."piano_abbonamento";--> statement-breakpoint
CREATE TYPE "public"."piano_abbonamento" AS ENUM('express', 'explore', 'experience');--> statement-breakpoint
ALTER TABLE "abbonamenti" ALTER COLUMN "piano_id" SET DATA TYPE "public"."piano_abbonamento" USING "piano_id"::"public"."piano_abbonamento";--> statement-breakpoint
ALTER TABLE "piani" ALTER COLUMN "id" SET DATA TYPE "public"."piano_abbonamento" USING "id"::"public"."piano_abbonamento";--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "piano" SET DATA TYPE "public"."piano_abbonamento" USING "piano"::"public"."piano_abbonamento";--> statement-breakpoint
ALTER TABLE "piani" ADD COLUMN "costo_utente_aggiuntivo" numeric(10, 2) DEFAULT '19' NOT NULL;--> statement-breakpoint
ALTER TABLE "piani" ADD COLUMN "descrizione" text DEFAULT '' NOT NULL;