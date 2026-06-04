# 09 — Progressions-Graph je Übung

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 28–30

## What to build

Je **Übung** ein Graph: **Y = Gewicht (erster Satz)**, **X = Zeit** mit umschaltbarer Spanne **Woche / Monat / Jahr**; die Übung ist auswählbar. Die Datenpunkte stammen aus allen **Einheiten**, die diese Übung enthalten. Hier entsteht das getestete reine Modul **Graph-Datenreihe**.

## Acceptance criteria

- [ ] Übung auswählen und ihren Graphen sehen
- [ ] Y = Gewicht des ersten Satzes, X = Zeit
- [ ] Spanne Woche / Monat / Jahr umschaltbar
- [ ] Nur Einheiten mit der jeweiligen Übung fließen ein
- [ ] Unit-Tests der Graph-Datenreihe (Spannen-Abgrenzung, Filter auf Übung) grün

## Blocked by

- #05 — Einheit loggen & speichern
