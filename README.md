# Urentracker

Persoonlijke time-tracking app voor freelancers. Start een timer, log uren per project, bekijk earnings en genereer facturen als PDF.

**Live:** [urentracker-nine.vercel.app](https://urentracker-nine.vercel.app)

## Functionaliteit

- **Timer** — start/stop met beschrijving, project en tags
- **Handmatige invoer** — voeg entries toe met start- en eindtijd
- **Projectbeheer** — naam, kleur, klant, uurtarief en uurlimiet
- **Rapporten** — earnings KPIs en grafieken per periode
- **Facturatie** — PDF-facturen per project per maand
- **Multi-device** — data gesynchroniseerd via Supabase, timer loopt door op elk toestel

## Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- [Vercel](https://vercel.com) (hosting)

## Zelf hosten

### 1. Supabase opzetten

1. Maak een gratis project aan op [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, plak de inhoud van `supabase/schema.sql` en voer uit
3. Zet de **Email** auth provider aan onder **Authentication → Providers**
4. Maak je account aan via **Authentication → Users → Add user**
5. Optioneel: schakel nieuwe signups uit via **Authentication → Providers → Email → Disable signups**

### 2. Env-variabelen

```bash
cp .env.local.example .env.local
```

Vul in vanuit **Settings → API** in je Supabase-project:

```
VITE_SUPABASE_URL      = https://jouw-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = jouw-anon-key
```

`.env.local` valt onder het `*.local` patroon in `.gitignore` en komt nooit in git.

### 3. Vercel

Voeg dezelfde twee env-vars toe onder **Settings → Environment Variables** in je Vercel-project.

## Lokaal draaien

```bash
npm install
npm run dev
```

Open http://localhost:5173.
