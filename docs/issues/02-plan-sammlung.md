# 02 — Plan-Sammlung: Pläne anlegen, anzeigen, umbenennen, löschen

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Typ: **AFK** · User Stories: 1–5

## What to build

Der Nutzer verwaltet seine **Plan-Sammlung**: einen neuen **Plan** mit Namen anlegen, alle Pläne als Liste sehen, umbenennen und löschen. Plan-Daten werden über das Repository (IndexedDB) gespeichert und überleben Reload/Offline. Ein **Plan** ist hier zunächst nur Name + (leere) Übungsliste — das Befüllen mit Übungen kommt im Plan-Editor (#04).

## Acceptance criteria

- [ ] Plan mit Namen anlegen; erscheint in der Liste
- [ ] Alle Pläne als Liste sichtbar
- [ ] Plan umbenennen
- [ ] Plan löschen
- [ ] Änderungen bleiben nach Reload und im Offline-Modus erhalten

## Blocked by

- #01 — Walking Skeleton
