# 08 — Steigerungs-Vorschlag (doppelte Progression)

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 25–27

## What to build

Die **Progressions-Engine** (reines Modul) wertet die Historie einer **Übung** aus: erreicht der **erste Satz** die **Zielwiederholungen** in **zwei** die-Übung-enthaltenden Einheiten in Folge, entsteht ein **Vorschlag** = aktuelles Gewicht + **Schrittweite**. Der Vorschlag wird im Training angezeigt; **annehmen** füllt beim nächsten Mal **alle Sätze** der Übung aufs neue Gewicht vor; **ignorieren** lässt alles unverändert (nicht bindend). Lücken oder ein Übungstausch unterbrechen die Serie nicht.

## Acceptance criteria

- [ ] 1× Ziel erreicht → kein Vorschlag; 2× in Folge → Vorschlag „+Schrittweite"
- [ ] Vorschlag annehmen → alle Sätze der Übung beim nächsten Mal aufs neue Gewicht
- [ ] Vorschlag ignorierbar (nicht bindend), Werte manuell überschreibbar
- [ ] Lücke/Übungstausch unterbricht die Serie nicht
- [ ] Unit-Tests der Progressions-Engine (alle Szenarien) grün

## Blocked by

- #06 — Fortschreiben: Vorausfüllung aus letzter Einheit + Auto-Übernahme
