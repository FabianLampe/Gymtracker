# 01 — Walking Skeleton: installierbare Offline-PWA + Persistenz-Grundgerüst

> Quelle: [PRD](../prd/0001-gymtracker-v1.md) · Architektur: [ADR 0001](../adr/0001-pwa-first-spaeter-nativer-neuschrieb.md), [ADR 0002](../adr/0002-lokal-first-mit-json-export.md) · Typ: **HITL**

## What to build

Das lauffähige Grundgerüst der PWA, an einem trivialen Beispiel durch **alle Schichten** hindurch. Die App startet im Browser, ist per Safari auf den iPhone-Homescreen installierbar (Web-App-Manifest, eigenes Icon, Vollbild) und funktioniert offline (Service Worker cached die App-Shell). Etabliert die TypeScript-Toolchain, den Test-Runner und das Persistenz-Grundgerüst: einen **Repository-Port** (Interface für CRUD über Übungskatalog/Pläne/Einheiten) mit einer **IndexedDB-Implementierung** und einem **In-Memory-Fake** für Tests. End-to-end demonstriert, indem ein triviales Datum gespeichert wird und Reload **und** Offline-Neustart überlebt.

HITL, weil hier die offene **Stack-/Framework-Entscheidung** fällt, das Scaffold einmal reviewt wird und die 5 offenen Annahmen aus dem PRD bestätigt werden.

## Acceptance criteria

- [ ] App startet lokal (Dev-Server) und als statischer Build, der auf Windows erzeugt wird
- [ ] Auf dem iPhone per Safari „Zum Home-Bildschirm" installierbar; öffnet im Vollbild mit eigenem Icon
- [ ] Nach erstem Laden offline nutzbar (App-Shell via Service Worker gecached)
- [ ] Repository-Port definiert; IndexedDB-Implementierung + In-Memory-Fake vorhanden
- [ ] Ein triviales gespeichertes Datum überlebt Reload und Offline-Neustart
- [ ] Stack-/Framework-Entscheidung dokumentiert; die 5 offenen PRD-Annahmen bestätigt

## Blocked by

None - can start immediately.
