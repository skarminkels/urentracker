# Urentracker

Een lokale time-tracking app gebaseerd op Toggl Track. Draait volledig in de browser zonder backend.

## Starten

```bash
npm install
npm run dev
```

Open daarna http://localhost:5173 in je browser.

## Functionaliteit

- **Timer**: Start/stop timer met beschrijving, project en billable toggle
- **Manual entry**: Voeg entries manueel toe met start- en eindtijd
- **Projects**: Beheer projecten met naam, kleur en klant
- **Reports**: Overzicht van vandaag/week + bar chart en pie chart per project
- **Continue**: Klik op play bij een oude entry om dezelfde taak opnieuw te starten

## Data

Alle data wordt opgeslagen in `localStorage`. De timer blijft lopen bij het herladen van de pagina.
