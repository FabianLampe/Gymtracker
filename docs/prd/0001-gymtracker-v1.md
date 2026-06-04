# PRD: Gymtracker v1 (PWA)

> Vokabular siehe [CONTEXT.md](../../CONTEXT.md). Architektur siehe [ADR 0001](../adr/0001-pwa-first-spaeter-nativer-neuschrieb.md) (PWA-first) und [ADR 0002](../adr/0002-lokal-first-mit-json-export.md) (Lokal-first + JSON-Export).

## Problem Statement

Ich trainiere mit Gewichten nach eigenen Plänen (z. B. Push/Pull/Beine) und will auf meinem iPhone drei Dinge: schnell sehen, was heute drankommt; mit minimalem Tippaufwand festhalten, was ich tatsächlich gemacht habe; und meinen Fortschritt je Übung über die Zeit sehen. Bestehende Apps sind mir entweder zu starr (zwingen mich, einen Plan exakt abzuarbeiten) oder reines Frei-Loggen (keine Struktur, keine automatische Steigerung). Außerdem entwickle ich auf Windows und habe keinen Mac.

## Solution

Eine **PWA**, die ich per Safari auf den iPhone-Homescreen lege und offline im Gym nutze. Ich pflege ein paar benannte **Pläne**, wähle einen zum Trainieren und sehe die Werte vom **letzten Mal vorausgefüllt**. Ich ändere nur, was anders ist — Übung tauschen, Satz hinzufügen, Gewicht pro Satz anpassen — und beende. Die App speichert jede **Einheit**, schlägt eine Gewichtssteigerung vor, wenn ich im **ersten Satz** meine **Zielwiederholungen** zweimal in Folge erreiche (nicht bindend), und zeigt je Übung einen **Progressions**-Graphen (Gewicht über Zeit). Meine Daten kann ich als **JSON exportieren** — als Backup und als Brücke zur späteren nativen App.

## User Stories

**Pläne & Plan-Sammlung**
1. Als Nutzer möchte ich einen neuen **Plan** mit Namen anlegen (z. B. „Push"), damit ich meine Trainingstage strukturieren kann.
2. Als Nutzer möchte ich meine mehreren Pläne als Liste sehen, damit ich den Überblick behalte.
3. Als Nutzer möchte ich einen Plan zum Trainieren auswählen, damit ich heute loslegen kann.
4. Als Nutzer möchte ich einen Plan umbenennen, damit ich ihn nachträglich anpassen kann.
5. Als Nutzer möchte ich einen Plan löschen, damit ich aufräumen kann.
6. Als Nutzer möchte ich einem Plan Übungen aus dem **Übungskatalog** hinzufügen, damit der Plan meine Bewegungen enthält.
7. Als Nutzer möchte ich Übungen aus einem Plan entfernen, damit ich ihn anpassen kann.
8. Als Nutzer möchte ich die Reihenfolge der Übungen im Plan ändern, damit sie meiner Trainingsabfolge entspricht.
9. Als Nutzer möchte ich je Plan-Übung **Zielwiederholungen**, Satzzahl, **Schrittweite** und Startwerte (Start-Gewicht/-Wdh) festlegen, damit Vorausfüllung und Vorschläge funktionieren.

**Übungskatalog**
10. Als Nutzer möchte ich aus einer **mitgelieferten** Übungs-Bibliothek (nach Muskelgruppe gegliedert) wählen, damit ich nicht alles selbst eintippen muss.
11. Als Nutzer möchte ich eine eigene Übung anlegen (Name + Muskelgruppe), damit auch nicht enthaltene Bewegungen abgedeckt sind.
12. Als Nutzer möchte ich den Katalog nach Muskelgruppe filtern/durchsuchen, damit ich Übungen schnell finde.
13. Als Nutzer möchte ich eine eigene Übung bearbeiten oder löschen, damit ich Fehler korrigieren kann.

**Training / Einheit**
14. Als Nutzer möchte ich beim Starten eines Plans die Werte vom letzten Mal vorausgefüllt sehen, damit ich nur Abweichungen eintippen muss.
15. Als Nutzer möchte ich beim allerersten Training eines Plans die beim Erstellen festgelegten Startwerte sehen, weil es noch kein „letztes Mal" gibt.
16. Als Nutzer möchte ich pro **Satz** Wiederholungen und Gewicht eintragen/ändern, damit ich festhalte, was ich geschafft habe.
17. Als Nutzer möchte ich das Gewicht in einzelnen Sätzen reduzieren (Back-off), weil spätere Sätze oft leichter werden.
18. Als Nutzer möchte ich während des Trainings einen Satz hinzufügen, damit ich spontan mehr machen kann.
19. Als Nutzer möchte ich einen Satz entfernen, falls ich weniger mache.
20. Als Nutzer möchte ich während des Trainings eine Übung tauschen oder hinzufügen, damit ich flexibel auf das Gym reagieren kann (Abweichung überschreibt den Plan fürs nächste Mal).
21. Als Nutzer möchte ich das Training beenden, damit es als datierte **Einheit** dauerhaft gespeichert wird.
22. Als Nutzer möchte ich, dass beim Beenden nicht angefasste Übungen/Sätze automatisch mit den Werten vom letzten Mal gespeichert werden, damit ich nicht alles bestätigen muss.
23. Als Nutzer möchte ich vergangene Einheiten einsehen (Verlauf), damit ich nachvollziehen kann, was ich wann gemacht habe.
24. Als Nutzer möchte ich eine abgeschlossene Einheit nachträglich korrigieren können, falls mir ein Tippfehler unterlaufen ist.

**Progression & Vorschlag**
25. Als Nutzer möchte ich einen **Vorschlag** „+Schrittweite" sehen, wenn mein erster Satz die Zielwiederholungen in zwei Einheiten in Folge erreicht, damit ich rechtzeitig steigere.
26. Als Nutzer möchte ich einen Vorschlag annehmen, damit beim nächsten Training alle Sätze der Übung mit dem neuen Gewicht vorausgefüllt sind.
27. Als Nutzer möchte ich einen Vorschlag ignorieren und das Gewicht selbst setzen, weil der Vorschlag nicht bindend ist.

**Progressions-Graph**
28. Als Nutzer möchte ich je Übung einen Graphen sehen, der das Gewicht (erster Satz) über die Zeit zeigt, damit ich meinen Fortschritt erkenne.
29. Als Nutzer möchte ich die Zeitspanne des Graphen umschalten (Woche/Monat/Jahr), damit ich kurz- und langfristigen Verlauf sehe.
30. Als Nutzer möchte ich auswählen, welcher Übung ich den Graphen ansehe.

**Daten / Export-Import**
31. Als Nutzer möchte ich alle meine Daten als JSON exportieren, damit ich ein Backup gegen Geräteverlust/iOS-Löschung habe.
32. Als Nutzer möchte ich ein zuvor exportiertes JSON importieren, damit ich meinen Stand wiederherstellen kann.
33. Als Nutzer möchte ich, dass das Export-Format stabil/versioniert ist, damit die spätere native App meine Historie übernehmen kann.

**PWA / Offline**
34. Als Nutzer möchte ich die App auf den iPhone-Homescreen installieren (eigenes Icon, Vollbild), damit sie sich wie eine App anfühlt.
35. Als Nutzer möchte ich die App offline im Gym nutzen, weil der Empfang dort oft schlecht ist.
36. Als Nutzer möchte ich, dass meine Daten lokal auf dem Gerät bleiben, ohne Konto oder Server.

## Implementation Decisions

**Domänenmodell (Vokabular aus CONTEXT.md)**
- **Übungskatalog**: Einträge mit `Name` + `Muskelgruppe`; Herkunft `mitgeliefert | eigen`. Einzige Quelle der Übungs-Identität (stabil über Pläne/Einheiten) → Voraussetzung für saubere Graph-Aggregation.
- **Plan**: Name + geordnete Liste von **Plan-Übungen**. „Lebende Liste": Edits während des Trainings überschreiben ihn.
- **Plan-Übung** (Verwendung einer Katalog-Übung in einem Plan): trägt `Zielwiederholungen` (feste Zahl, am ersten Satz gemessen), `Satzzahl`, `Schrittweite` (Default 2,5 kg) und Startwerte. Diese Einstellungen liegen **pro Plan** — dieselbe Übung kann in zwei Plänen anders eingestellt sein. (Annahme, vom Nutzer noch nicht final bestätigt.)
- **Einheit**: datierter Datensatz eines absolvierten Trainings; verweist auf ihren Plan; enthält Übungen mit absolvierten **Sätzen**.
- **Satz**: `Wiederholungen × Gewicht` (kg). Gewicht und Wdh pro Satz frei (Back-off erlaubt). Genau ein Satz-Typ in v1; Körpergewicht via Zusatzgewicht (0 erlaubt); kein Cardio/Zeit.

**Module (mit Nutzer bestätigt)** — keine Dateipfade, nur konzeptuelle Schnittstellen:

1. **Progressions-Engine** (tief, rein). Eingabe: geordnete Historie einer Übung (je Einheit der erste Satz: Wdh + Gewicht) + Einstellungen (Zielwiederholungen, Schrittweite, aktuelles Gewicht). Ausgabe: optionaler **Vorschlag** (neues Gewicht) oder keiner. Regel: erster Satz erreicht die Zielwiederholungen in den letzten **zwei** die-Übung-enthaltenden Einheiten in Folge → Vorschlag = aktuelles Gewicht + Schrittweite. Lücken/Tausch unterbrechen die Serie nicht. Keine Seiteneffekte.
2. **Vorausfüllung & Abschluss** (tief, rein).
   - *Vorausfüllung*: Eingabe Plan + letzte Einheit (optional) + offener Vorschlag (optional) → vorbereitete Sätze je Übung. Quelle: letzte Einheit; sonst Plan-Startwerte; angenommener Vorschlag setzt **alle** Sätze der Übung auf das neue Gewicht (Zielwiederholungen unverändert).
   - *Abschluss*: Eingabe laufendes Training (vorausgefüllt + Edits) → fertige **Einheit**. Nicht angefasste Werte = Vorausfüllung (Auto-Übernahme); auto-übernommene Werte zählen **voll als absolviert** (Graph + Vorschlags-Serie).
3. **Graph-Datenreihe** (tief, rein). Eingabe: alle Einheiten + Übungs-Identität + Zeitspanne (Woche/Monat/Jahr) → Punkte `{Datum, Gewicht=erster Satz}`, gefiltert auf Einheiten mit dieser Übung.
4. **Export/Import** (tief, rein). `export(state) → versioniertes JSON`; `import(json) → state | Fehler` mit Schema-/Versionsprüfung. Pflicht-Feature ab v1 (ADR 0002).
5. **Speicher (Repository)** (Infra). Port-Interface mit CRUD für Katalog, Pläne, Einheiten; Implementierung gegen **IndexedDB**. Die Domänen-Module hängen nur am Interface, nicht an IndexedDB. Test über In-Memory-Fake.
6. **Übungskatalog** (Daten + CRUD). Mitgelieferte Seed-Übungen (nach Muskelgruppe) werden beim ersten Start eingespielt; eigene Übungen über das Repository.
7. **UI / Screens** (flach). Plan-Sammlung, Plan-Editor, Training-Screen, Progressions-Graph, Einstellungen/Export. Liest/schreibt über das Repository und ruft die Domänen-Module (1–4).
- **PWA-Infra**: Service Worker (Offline-Cache der App-Shell), Web-App-Manifest (Homescreen-Install, Icon, Vollbild).

**Architektur / Tech**
- PWA als Phase 1, vollständig auf Windows baubar (ADR 0001). Phase 2 = nativer Swift-Neuschrieb; nur die Daten wandern über Export mit.
- Lokal-first: IndexedDB als Datenspeicher; **kein** Cloud-Backend; Backup ausschließlich über manuellen JSON-Export (ADR 0002).
- Sprache **TypeScript**; der Domänen-Kern (Module 1–4) ist bewusst **framework- und speicher-unabhängig** (reine Funktionen über einfache Datentypen), damit er testbar bleibt und die Regeln den Phase-2-Neuschrieb konzeptionell überleben.
- Einheiten: **kg** (kein lb in v1).

**Schema-Entscheidungen**
- Export-JSON trägt ein **Versionsfeld**; Import prüft die Version und lehnt Unbekanntes sauber ab (bzw. migriert).
- Übungen haben eine stabile Identität (ID), auf die Plan-Übungen und Einheiten verweisen — Umbenennen einer Übung darf den Graph-Verlauf nicht zerreißen.

## Testing Decisions

- **Was ein guter Test ist**: prüft **externes Verhalten** über die öffentliche Schnittstelle eines Moduls (Eingabe → Ausgabe), nicht interne Implementierungsdetails. Tests sollen bei einer Refaktorierung mit gleichem Verhalten grün bleiben. Bevorzugt reine Funktionen ohne UI/IO, mit Beispiel-Szenarien aus dem Domänen-Vokabular.
- **Getestete Module** (mit Nutzer bestätigt): **Progressions-Engine**, **Vorausfüllung & Abschluss**, **Graph-Datenreihe**, **Export/Import**. Zusätzlich das **Repository** über einen In-Memory-Fake (Vertrags-Test), damit die UI-nahe Schicht ohne echte IndexedDB prüfbar ist.
- **Beispiel-Szenarien**:
  - Progressions-Engine: 1× Ziel erreicht → kein Vorschlag; 2× in Folge → Vorschlag = +Schrittweite; ausgelassene Einheit/Übungstausch → Serie hält; schwächere Folgesätze → ohne Einfluss; Vorschlag bereits angenommen → Serie zurückgesetzt.
  - Vorausfüllung & Abschluss: erstes Mal → Plan-Startwerte; sonst → letzte Einheit; angenommener Vorschlag → alle Sätze +Schrittweite; unberührte Übung beim Beenden → als absolviert gespeichert.
  - Graph-Datenreihe: Y = Gewicht erster Satz; Spanne Woche/Monat/Jahr grenzt korrekt ab; nur Einheiten mit der jeweiligen Übung fließen ein.
  - Export/Import: `import(export(state)) == state`; defektes JSON → Fehler; unbekannte Version → abgelehnt/migriert.
- **Prior art**: keine (Greenfield). Dieser PRD etabliert die Test-Konvention. Empfehlung: ein schneller TS-Test-Runner (z. B. Vitest) für die reinen Module; Repository-Fake als wiederverwendbare Test-Hilfe.

## Out of Scope

- RPE, Pausenzeit, Notizen pro Satz.
- Cardio-/Zeit-/Distanz-Übungen; mehr als ein Satz-Typ.
- Maßeinheit lb (nur kg).
- Cloud-Sync, Konten, Multi-Device-Abgleich, automatisches Backup.
- Fester Wochenplan / kalendergesteuerte „heute ist Push-Tag"-Logik.
- App-Store-Veröffentlichung und die native Swift-App (= Phase 2).
- Geschätztes 1RM und Volumen-Graph (bewusst verworfen, nur Gewicht).
- Aufwärmsätze, Supersätze, Timer/Pausen-Wecker, Social-/Sharing-Funktionen.

## Further Notes

- **Noch zu bestätigende Annahmen** (Standardwerte sind im PRD bereits gesetzt): (1) angenommener Vorschlag füllt **alle** Sätze aufs neue Gewicht vor; (2) Übungs-Einstellungen liegen **pro Plan**; (3) Graph-„Gewicht" = **erster Satz**; (4) abgeschlossene Einheiten sind **korrigierbar**; (5) Vorausfüllung beim ersten Mal = **Plan-Startwerte**.
- **Entwickler-Aufgabe**: die mitgelieferte Übungs-Bibliothek (Übungen + Muskelgruppen) beschaffen/kuratieren — nur Kraft-/Gewicht-Übungen.
- **Bewusst akzeptierter Kompromiss** der Auto-Übernahme: Der Graph kann Phantom-Einträge zeigen und Vorschläge können für übersprungene Übungen auslösen; da Vorschläge nicht bindend sind, ist das tolerierbar. Optionales späteres Feature: „nur für heute"-Abweichung, ohne den Plan zu überschreiben.
- **Veröffentlichung**: Dieses Projekt hat (noch) kein Git/keinen Issue-Tracker; der PRD liegt daher als Datei unter `docs/prd/`. Bei GitHub/Linear/Jira kann er dorthin überführt und mit der `to-issues`-Vorgehensweise in Tickets geschnitten werden.
