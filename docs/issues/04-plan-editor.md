# 04 — Plan-Editor: Übungen hinzufügen & konfigurieren

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 6–9

## What to build

Im Plan-Editor stellt der Nutzer einen **Plan** zusammen: Katalog-Übungen hinzufügen, je **Plan-Übung** `Zielwiederholungen`, Satzzahl, `Schrittweite` (Default 2,5 kg) und Startwerte (Start-Gewicht/-Wdh) festlegen, die Reihenfolge ändern und Übungen entfernen. Diese Einstellungen liegen **pro Plan** — dieselbe Übung darf in zwei Plänen unterschiedlich eingestellt sein. Alles persistiert über das Repository.

## Acceptance criteria

- [ ] Katalog-Übung zu einem Plan hinzufügen und entfernen
- [ ] Je Plan-Übung Zielwiederholungen, Satzzahl, Schrittweite (Default 2,5 kg) und Startwerte setzen
- [ ] Reihenfolge der Übungen im Plan ändern
- [ ] Einstellungen liegen pro Plan und bleiben erhalten

## Blocked by

- #02 — Plan-Sammlung
- #03 — Übungskatalog
