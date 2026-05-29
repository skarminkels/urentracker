# Urentracker

Een persoonlijke time-tracking app. Draait in de browser met Supabase als backend — data beschikbaar op alle toestellen na inloggen.

**Live:** [urentracker-nine.vercel.app](https://urentracker-nine.vercel.app)

## Setup

### 1. Supabase-project aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account en project aan
2. Open **SQL Editor** → **New query**, plak de inhoud van `supabase/schema.sql` en voer uit
3. Ga naar **Authentication → Providers** en zorg dat **Email** provider actief is
4. Maak je account aan via **Authentication → Users → Add user** (gebruik je eigen e-mailadres)
5. Optioneel: schakel nieuwe signups uit via **Authentication → Providers → Email → Disable signups**

### 2. Env-vars instellen

Kopieer `.env.local.example` naar `.env.local` en vul in:

```bash
cp .env.local.example .env.local
```

De waarden vind je in je Supabase-project onder **Settings → API**:
- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_ANON_KEY`: anon / public key

`.env.local` staat al in `.gitignore` via het `*.local` patroon — dit bestand komt nooit in git.

### 3. Vercel deployment

Voeg dezelfde twee env-vars toe in je Vercel-project:
**Settings → Environment Variables → Add**

```
VITE_SUPABASE_URL      = https://jouw-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = jouw-anon-key
```

## Lokaal draaien

```bash
npm install
npm run dev
```

Open daarna http://localhost:5173.

## Gratis tier

Alles blijft binnen de Supabase gratis tier:
- 500 MB database
- 50.000 MAU (monthly active users) — voor 1 gebruiker geen enkel probleem
- Onbeperkte API requests

## Functionaliteit

- **Timer**: Start/stop timer met beschrijving, project en tags
- **Manual entry**: Voeg entries manueel toe met start- en eindtijd
- **Projects**: Beheer projecten met naam, kleur, klant, uurtarief en uurlimiet
- **Reports**: Earnings KPIs + grafieken (tijd en verdiensten)
- **Facturatie**: Genereer PDF-facturen per project per maand
- **Multi-device**: Log in op elk toestel — timer en data zijn overal gesynchroniseerd

## Data

Data wordt opgeslagen in Supabase Postgres. Elke tabel heeft Row Level Security: jij leest en schrijft enkel jouw eigen data. De lopende timer wordt ook in de database bewaard, zodat je op een ander toestel kunt zien dat hij loopt.
