# Tech-Stack: Vite + React + TypeScript + Dexie + Vitest + vite-plugin-pwa + Recharts

PWA-Entwicklung auf Windows 10, Single-User, kein Backend. Wir brauchen schnelles DX auf Windows, offline-fähige Installation auf dem iPhone und eine testbare, framework-unabhängige Domänenschicht.

**Entscheidung:** Vite + React + TypeScript als Basis; Dexie.js als IndexedDB-Wrapper; Vitest als Test-Runner (selbe Config wie Vite); vite-plugin-pwa (Workbox) für Service Worker + Web-App-Manifest; Recharts für den Progressions-Graph; kein zusätzliches State-Management (Dexie als Source of Truth + React State/Context).

## Considered Options

- **Svelte statt React** — verworfen (React-Ökosystem größer, alle Libs native; Svelte wäre auch ok, aber kein Vorteil der die Wahl aufzwingen würde).
- **Next.js** — verworfen (SSR-Overhead für eine lokal-only App unnötig).
- **Anderes State-Management (Zustand/Redux)** — verworfen (Dexie als persistenter Store + React-State reicht für diese Scope-Größe).

## Consequences

- Die Domänen-Module (Progressions-Engine, Vorausfüllung & Abschluss, Graph-Datenreihe, Export/Import) sind reine TS-Funktionen ohne React/Dexie-Abhängigkeit — direkt mit Vitest testbar.
- Der Repository-Port wird als Interface definiert; Dexie-Implementierung + In-Memory-Fake implementieren es separat.
- Für den Phase-2-iOS-Neuschrieb (Swift) wandern nur Daten (JSON-Export) und die Domänen-Regeln konzeptionell — kein Code.
