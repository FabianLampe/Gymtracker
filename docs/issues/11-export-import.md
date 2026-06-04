# 11 — Export / Import (JSON)

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Architektur: [ADR 0002](../adr/0002-lokal-first-mit-json-export.md) · Typ: **AFK** · User Stories: 31–33

## What to build

Den gesamten Zustand (Übungskatalog inkl. eigener Übungen, Pläne, Einheiten) als **versioniertes JSON exportieren** (Backup gegen iOS-Eviction und Brücke zur späteren nativen App) und wieder **importieren** (Wiederherstellen). Der Import prüft Schema und Version und lehnt Defektes sauber ab. Hier entsteht das getestete reine Modul **Export/Import** (Round-Trip).

## Acceptance criteria

- [ ] Export erzeugt eine JSON-Datei mit Versionsfeld
- [ ] Import stellt den gesamten Zustand wieder her
- [ ] `import(export(state))` ergibt denselben Zustand (Round-Trip)
- [ ] Defektes oder unbekannt-versioniertes JSON wird sauber abgefangen
- [ ] Unit-Tests Export/Import (Round-Trip + Fehlerfälle) grün

## Blocked by

- #05 — Einheit loggen & speichern
