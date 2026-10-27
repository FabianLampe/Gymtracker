# Gymtracker

Offline-fähige iPhone-App (PWA) zum Verfolgen eines selbst erstellten Trainingsplans und der **Progression je Übung**.

Kernschleife: Plan folgen → Ist-Werte eintragen (frei abweichend) → Fortschritt je Übung als Graph sehen.

## Funktionen
- Mehrere Trainingspläne als „lebende Listen“, Übungskatalog mit eigenen Übungen
- Einheiten loggen, Werte aus der letzten Einheit werden vorausgefüllt
- **Steigerungs-Vorschlag** nach dem Prinzip der doppelten Progression (nicht bindend)
- Progressions-Graph je Übung (Woche / Monat / Jahr), Einheiten nachträglich korrigieren
- Daten bleiben lokal auf dem Gerät, Export/Import als JSON

## Tech Stack
React 18 · TypeScript · Vite · Dexie (IndexedDB) · Recharts · vite-plugin-pwa · Vitest

Architekturentscheidungen stehen als ADRs in [docs/adr](docs/adr), die Anforderungen im [PRD](docs/prd/0001-gymtracker-v1.md), die Fachbegriffe in [CONTEXT.md](CONTEXT.md).

## Entwicklung
```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Tests
npm run build    # Produktionsbuild
```

Weiterentwicklung: [mia-gymtracker](https://github.com/FabianLampe/mia-gymtracker) (private).
