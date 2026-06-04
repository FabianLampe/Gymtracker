# 05 — Einheit loggen & speichern

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 14–16, 21, 23

## What to build

Der Kern-Loop. Der Nutzer wählt einen **Plan** und startet ein Training. Die Sätze sind aus den **Plan-Startwerten vorausgefüllt** (beim ersten Mal gibt es kein „letztes Mal"). Er trägt je **Satz** Wiederholungen × Gewicht ein und beendet — daraus entsteht eine datierte, gespeicherte **Einheit**, die im Verlauf sichtbar ist. Hier entsteht das getestete reine Modul **Vorausfüllung & Abschluss** (Variante: Quelle = Plan-Startwerte).

## Acceptance criteria

- [ ] Training aus einem Plan starten; Sätze aus den Plan-Startwerten vorausgefüllt
- [ ] Wiederholungen × Gewicht je Satz eintragen/ändern
- [ ] Beenden erzeugt eine datierte **Einheit** (gespeichert, überlebt Reload/Offline)
- [ ] Vergangene Einheiten im Verlauf sichtbar
- [ ] Unit-Tests für Vorausfüllung (aus Plan-Startwerten) & Abschluss grün

## Blocked by

- #04 — Plan-Editor
