# Sapunto — Istruzioni per Claude Code

## Workflow

- Fai sempre commit e push alla fine di modifiche importanti. Non aspettare che l'utente lo chieda.
- **PRIMA di ogni commit**, esegui `npm run build` nella cartella `sapunto-saas/` e verifica che il build vada a buon fine. Non pushare codice che non compila.

## Note tecniche

- Il progetto è deployato su Vercel. Le variabili d'ambiente (DATABASE_URL, API keys) sono configurate solo nel runtime di Vercel, NON disponibili a build time. Qualsiasi import di moduli che dipendono da env vars deve essere lazy (non al top-level del modulo).
- Cartella progetto: `sapunto-saas/`
