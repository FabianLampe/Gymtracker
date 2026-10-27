# Gymtracker

Progressive web app for following a training plan and tracking progression per exercise. Data stays on the device (IndexedDB) and can be exported and imported as JSON.

- Several training plans and an exercise catalogue with custom exercises
- Logging sessions, with values pre-filled from the last session
- Weight increase suggestions based on double progression
- Progression chart per exercise (week, month, year)

Built with React, TypeScript, Vite, Dexie, Recharts and vite-plugin-pwa. Tests use Vitest.

Design decisions are recorded in [docs/adr](docs/adr), requirements in the [PRD](docs/prd/0001-gymtracker-v1.md) and domain terms in [CONTEXT.md](CONTEXT.md).

## Development

```
npm install
npm run dev
npm test
npm run build
```
