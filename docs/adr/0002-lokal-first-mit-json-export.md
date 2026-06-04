# Lokal-first mit JSON-Export, kein Cloud-Backend

Die PWA wird offline im Gym genutzt (Single-User). iOS/Safari kann lokale PWA-Daten (IndexedDB) bei Speicherdruck oder längerer Inaktivität **eigenmächtig löschen**, und Phase 2 ist ein kompletter Neuschrieb ohne Code-Sharing ([ADR 0001](./0001-pwa-first-spaeter-nativer-neuschrieb.md)). Daher: Daten liegen **lokal** (IndexedDB) in einem **klar dokumentierten Schema**, und es gibt **ab v1 Export/Import als JSON**.

## Considered Options

- **Cloud-Sync von Anfang an** (z. B. Supabase/Firebase) — verworfen: Konto + Backend nötig, Online-Abhängigkeit (Gym-Empfang), mehr Setup.
- **Export erst kurz vor dem Umstieg** — verworfen: kein Backup gegen iOS-Eviction in der Zwischenzeit, leicht zu vergessen.

## Consequences

- **JSON-Export ist Pflicht-Feature ab v1** — zugleich Backup gegen iOS-Eviction *und* Brücke, über die die native App (Phase 2) die Historie importiert.
- Kein automatisches Multi-Device-Sync; Backup ist eine **manuelle** Nutzeraktion (Export-Knopf).
- Das Datenschema muss von Anfang an sauber/versioniert sein, damit ein späterer Import verlustfrei gelingt.
