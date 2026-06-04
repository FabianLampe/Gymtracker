# 03 — Übungskatalog: mitgelieferte Bibliothek + eigene Übungen

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 10–13

## What to build

Der **Übungskatalog** als einzige Quelle der Übungs-Identität. Eine **mitgelieferte** Bibliothek (nur Kraft-/Gewicht-Übungen, nach **Muskelgruppe** gegliedert) wird beim ersten Start eingespielt. Der Nutzer kann sie nach Muskelgruppe filtern/durchsuchen und **eigene** Übungen (Name + Muskelgruppe) anlegen, bearbeiten und löschen. Jede **Übung** hat eine stabile ID, damit ein späteres Umbenennen den Progressions-Verlauf nicht zerreißt.

## Acceptance criteria

- [ ] Mitgelieferte Übungen sind nach erstem Start vorhanden, nach Muskelgruppe gruppiert
- [ ] Katalog nach Muskelgruppe filtern/durchsuchen
- [ ] Eigene Übung anlegen, bearbeiten, löschen
- [ ] Übungen haben stabile IDs; Umbenennen ändert die Identität nicht
- [ ] Daten bleiben nach Reload/Offline erhalten

## Blocked by

- #01 — Walking Skeleton
