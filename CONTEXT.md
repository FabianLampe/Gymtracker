# Gymtracker

iPhone-App zum Verfolgen eines selbst erstellten Trainingsplans und zum Nachverfolgen der Progression je Übung. Kernschleife: einem Plan folgen → Ist-Werte eintragen (frei abweichend) → Fortschritt je Übung als Graph sehen.

## Language

**Plan**:
Eine benannte, wiederverwendbare Trainingsvorlage (z. B. „Push"). Du pflegst mehrere Pläne (deine *Plan-Sammlung*). Jeder Plan ist eine „lebende Liste": Änderungen während seines Trainings überschreiben ihn und gelten fürs nächste Mal.
_Avoid_: Programm, Routine, Vorlage, Split, Schema

**Einheit**:
Der dauerhaft gespeicherte, datierte Datensatz *eines tatsächlich absolvierten Trainings*. Unveränderlich nach Abschluss — bildet die Historie.
_Avoid_: Training (Alltagswort, mehrdeutig), Workout, Session

**Übung**:
Eine Trainingsbewegung, z. B. Bankdrücken — ein Eintrag im **Übungskatalog** mit Name und Muskelgruppe. Stabile Identität über alle Pläne/Einheiten (damit der Progressions-Graph greift).
_Avoid_: Exercise, Movement

**Übungskatalog**:
Die Sammlung verfügbarer Übungen: eine **mitgelieferte** Bibliothek (nach Muskelgruppe gegliedert) plus eigene, selbst angelegte Übungen. Einzige Quelle der Übungs-Identität.
_Avoid_: Bibliothek (allein), Datenbank

**Satz**:
Eine einzelne Ausführung einer Übung innerhalb einer Einheit, erfasst als **Wiederholungen × Gewicht**. Gewicht *und* Wiederholungen sind **pro Satz frei** — ein Reduzieren des Gewichts in späteren Sätzen (Back-off) ist ausdrücklich erlaubt. (RPE, Pausenzeit, Notiz in v1 bewusst weggelassen.)
_Avoid_: Set, Durchgang

**Progression**:
Die Entwicklung des **Gewichts** *einer Übung* über die Zeit, dargestellt als Graph: Y = Gewicht (erster Satz / Top-Satz), X = Zeit mit umschaltbarer Spanne (Woche / Monat / Jahr).
_Avoid_: Fortschritt (zu unspezifisch), Statistik

**Zielwiederholungen**:
Eine feste angestrebte Wiederholungszahl je Übung, gemessen am **ersten Satz** (Arbeitssatz). Dass Folgesätze weniger Wdh oder weniger Gewicht haben, ist normal und kein Hindernis.
_Avoid_: Rep-Goal, Wiederholungsziel

**Vorschlag**:
Eine *nicht-bindende* Empfehlung der App (z. B. „Gewicht +2,5 kg"), ausgelöst, wenn der **erste Satz** die Zielwiederholungen erreicht. Immer manuell überschreibbar. = Mechanik der *doppelten Progression* (Top-Satz-Variante). Schwelle: erster Satz erreicht die Zielwiederholungen in **zwei aufeinanderfolgenden** Einheiten.
_Avoid_: Empfehlung, Auto-Progression

**Schrittweite**:
Das pro Übung hinterlegte Gewichts-Inkrement für den Vorschlag (Default 2,5 kg, je Übung änderbar — z. B. 5 kg für Beinübungen).
_Avoid_: Increment, Steigerung

## Relationships

- Übungen stammen aus dem **Übungskatalog** (mitgeliefert + eigene); ein **Plan** referenziert Katalog-Übungen.
- Du pflegst mehrere **Pläne**; beim Trainieren wählst du einen aus.
- Ein **Plan** schreibt **Übungen** vor, jede mit geplanten **Sätzen**.
- Bearbeiten während des Trainings **überschreibt den gewählten Plan** (er wird fortgeschrieben) — pro Plan eine lebende Liste.
- Ein abgeschlossenes Training erzeugt genau eine **Einheit** (datiert, unveränderlich), die auf ihren Plan verweist.
- Eine **Einheit** enthält **Übungen**, jede mit absolvierten **Sätzen**.
- Eine geplante **Übung** trägt **Zielwiederholungen**, eine Satzzahl und eine **Schrittweite**; erreicht der erste Satz die Zielwiederholungen in zwei Einheiten in Folge, erzeugt die App einen **Vorschlag** (Gewicht + Schrittweite).
- Die in einer **Einheit** erreichten **Sätze** werden als editierbare Vorgabe ins nächste Training des Plans vorausgefüllt (Fortschreiben). Quelle der Vorausfüllung: die letzte Einheit des Plans; beim allerersten Mal die beim Plan-Erstellen eingetragenen Startwerte.
- Beim **Beenden** werden nicht angefasste Übungen/Sätze automatisch mit der Vorausfüllung gespeichert und **voll als absolviert** behandelt (Graph + Vorschlags-Serie). Es gibt keinen Unterschied zwischen „eingetippt" und „auto-übernommen".
- **Progression** einer **Übung** wird über alle **Einheiten** gelesen, die diese Übung enthalten.

## Example dialogue

> **Dev:** „Wenn ich am Montag eine Übung tausche — ändert das meinen **Plan** oder nur die heutige **Einheit**?"
> **Domain-Experte:** „Beides hängt zusammen: Die heutige **Einheit** speichert, was ich gemacht habe. Aber meine Änderung wird auch zum neuen **Plan** — es gibt nur eine lebende Liste."
> **Dev:** „Und die **Progression** für Bankdrücken?"
> **Domain-Experte:** „Die liest aus allen alten **Einheiten** mit Bankdrücken — als Graph pro Übung."

## Flagged ambiguities

- **„Plan" vs. „Einheit"**: Plan = aktuell editierbare Vorlage (eine lebende Liste, wird überschrieben). Einheit = unveränderlicher, datierter Verlaufseintrag. → Als getrennte Konzepte aufgelöst.
- **Einmal-Abweichung wird dauerhaft**: Ein spontaner Übungstausch landet dauerhaft im Plan (bewusst akzeptiert, geringe Reibung). Offen, ob es später ein „nur für heute" geben soll.
- **Plan-Struktur**: Bibliothek mehrerer benannter Pläne, frei wählbar (kein fester Wochentag-Zwang). → Aufgelöst. „Eine lebende Liste" gilt jetzt *pro Plan*, nicht global.
- **Inhalt eines Satzes**: Wiederholungen × Gewicht. RPE/Pause/Notiz vorerst weggelassen. → Aufgelöst.
- **Fortschreib-Mechanik**: Kombination aus (1) Vorausfüllen des zuletzt Erreichten (editierbar) UND (2) nicht-bindendem **Vorschlag** zur Gewichtssteigerung bei mehrfach erreichten **Zielwiederholungen** = doppelte Progression. → Aufgelöst.
- **Ziel-Form**: feste Zahl, gemessen am **ersten Satz** (Top-Satz-Modell); Folgesätze dürfen weniger Wdh/Gewicht haben. Gewicht ist **pro Satz** frei (Back-off erlaubt). → Aufgelöst.
- **Trigger-Schwelle**: erster Satz erreicht die Zielwiederholungen in **zwei aufeinanderfolgenden** Einheiten. → Aufgelöst. (Offen-Detail: zählt „in Folge" nur Einheiten, die die Übung enthalten? Annahme: ja, Lücken/Tausch unterbrechen die Serie nicht.)
- **Schrittweite**: pro Übung, Default 2,5 kg, editierbar. → Aufgelöst.
- **Nach Steigerung (Annahme)**: Vorschlag annehmen → alle Sätze füllen mit neuem Gewicht vor, Zielwiederholungen bleiben gleich; live ggf. weniger Wdh / spätere Sätze runterdrehen, über Einheiten wieder hocharbeiten. Vorschlags-Serie wird zurückgesetzt. (Noch zu bestätigen.)
- **Progressions-Kennzahl**: Y = Gewicht (erster/Top-Satz), X = Zeit, umschaltbar Woche/Monat/Jahr. e1RM & Volumen bewusst verworfen (zu abstrakt). → Aufgelöst. (Annahme: „Gewicht" = erster Satz.)
- **Übungs-Quelle**: **mitgelieferte** Bibliothek (nach Muskelgruppe) + eigene ergänzbare Übungen = Übungskatalog. → Aufgelöst. (Entwickler-Aufgabe: Übungsliste beschaffen/kuratieren.)
- **„Bibliothek" war doppeldeutig** (Pläne vs. Übungen): Übungen = **Übungskatalog**; Pläne = **Plan-Sammlung**. → Aufgelöst.
- **Annahme — Übungs-Einstellungen**: Zielwiederholungen/Satzzahl/Schrittweite liegen **pro Plan-Verwendung** der Übung (gleiche Übung kann in zwei Plänen anders eingestellt sein); der Katalog liefert nur Identität + Name + Muskelgruppe (+ ggf. Default-Schrittweite). (Noch zu bestätigen.)
- **Einheit kg** angenommen (kein lb in v1).
- **Übungs-Typen**: genau EIN Satz-Typ in v1 (Wdh × Gewicht); Körpergewicht via Zusatzgewicht (0 erlaubt); kein Cardio/Zeit. → Aufgelöst. Die mitgelieferte Bibliothek enthält entsprechend nur Kraft-/Gewicht-Übungen.
- **Auto-Übernahme beim Beenden**: Nicht eingetragene Übungen/Sätze werden beim Abschluss mit der Vorausfüllung (letztes Mal) gespeichert und wie wirklich absolviert behandelt — Graph *und* Steigerungs-Serie. Bewusst akzeptiert: kann Phantom-Einträge im Graphen erzeugen und Vorschläge für Übersprungenes auslösen; da Vorschläge nicht bindend sind, ignorierbar. → Aufgelöst.
