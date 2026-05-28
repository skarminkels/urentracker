# Urentracker

Een lokale time-tracking app gebaseerd op Toggl Track. Draait volledig in de browser zonder backend — alle data blijft op jouw toestel.

**Live:** [urentracker-nine.vercel.app](https://urentracker-nine.vercel.app)

## Lokaal draaien

```bash
npm install
npm run dev
```

Open daarna http://localhost:5173 in je browser.

## Deployment

De app wordt automatisch gedeployed via [Vercel](https://vercel.com). Elke push naar `main` triggert een nieuwe deploy. Geen server of database nodig — alles draait client-side.

## Functionaliteit

- **Timer**: Start/stop timer met beschrijving, project en billable toggle
- **Manual entry**: Voeg entries manueel toe met start- en eindtijd
- **Projects**: Beheer projecten met naam, kleur, klant en uurtarief
- **Reports**: Earnings KPIs + grafieken (tijd en verdiensten)
- **Continue**: Klik op play bij een oude entry om dezelfde taak opnieuw te starten

## Earnings & tarieven

- Stel een **uurtarief** in per project (optioneel) op de Projects pagina
- De **valuta** (€, $, £) is globaal instelbaar via de knoppenbalk op de Projects pagina
- **Live verdiensten** worden live getoond in de timerbar terwijl de timer loopt (mits project + tarief gekoppeld)
- Per time entry wordt het **tarief vastgelegd als snapshot** op het moment van stoppen — historische verdiensten blijven correct als je later het tarief van een project wijzigt
- Time entries tonen het **verdiende bedrag** naast de duur; dagtotalen tonen ook het dag-totaal in geld
- Reports toont vier **earnings KPI-cards** (today / this week / this month / YTD), een **earnings-per-maand barchart** (laatste 12 maanden) en een **earnings-per-project breakdown** van de huidige maand

## Data

Alle data wordt opgeslagen in `localStorage`. De timer blijft lopen bij het herladen van de pagina. De gekozen valuta wordt ook lokaal bewaard.
