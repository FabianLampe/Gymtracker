# 06 — Fortschreiben: Vorausfüllung aus letzter Einheit + Auto-Übernahme

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 14, 22

## What to build

Ab dem zweiten Training eines Plans kommt die Vorausfüllung aus der **letzten Einheit** statt aus den Plan-Startwerten (Fortschreiben). Beim Beenden werden **nicht angefasste** Übungen/Sätze automatisch mit der Vorausfüllung gespeichert und zählen **voll als absolviert** — es gibt keinen Unterschied zwischen „eingetippt" und „auto-übernommen". Erweitert das reine Modul **Vorausfüllung & Abschluss**.

## Acceptance criteria

- [ ] Zweites und folgendes Training füllt aus der letzten Einheit vor
- [ ] Nicht angefasste Übungen/Sätze werden beim Beenden als absolviert gespeichert
- [ ] Auto-übernommene Werte zählen für Verlauf und (spätere) Vorschlags-Serie wie echte
- [ ] Unit-Tests: Quelle = letzte Einheit; Auto-Übernahme zählt als absolviert

## Blocked by

- #05 — Einheit loggen & speichern
