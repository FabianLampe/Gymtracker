# 07 — Freie Abweichung im Training

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 17–20

## What to build

Während eines Trainings frei abweichen: einen **Satz** hinzufügen oder entfernen, das Gewicht **pro Satz** reduzieren (Back-off), eine **Übung** tauschen oder hinzufügen. Abweichungen **überschreiben den gewählten Plan** (lebende Liste) und gelten damit fürs nächste Mal.

## Acceptance criteria

- [ ] Satz hinzufügen und entfernen im laufenden Training
- [ ] Gewicht pro Satz frei wählbar (Back-off, also Reduzieren in späteren Sätzen, möglich)
- [ ] Übung während des Trainings tauschen oder hinzufügen
- [ ] Abweichung überschreibt den Plan; das nächste Training spiegelt sie wider

## Blocked by

- #05 — Einheit loggen & speichern
