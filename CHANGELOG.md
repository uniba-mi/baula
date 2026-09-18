# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] [unreleased]
### Added
- FlexNow-Integration: automatisierter Noten-/Modul-Import aus FlexNow, inkl. Abgleich mit bereits abgeschlossenen Modulen, Lade-Anzeige während des Imports
- Prüfungsversuche werden aus FlexNow importiert und gespeichert: je Modul die gesamte Historie mit Semester, Versuchsnummer, Note und Prüfungsbemerkung. Wiederholungsversuche gehen damit nicht mehr verloren – bisher überlebte nur das Ergebnis der jüngsten Ablegung. Angezeigt wird die Historie noch nicht
- Jeder Prüfungsversuch merkt sich seine Herkunft (FlexNow oder selbst eingetragen); ein erneuter Abgleich ersetzt nur die zuvor importierten Versuche
- Feature-Wunsch-Widget: Nutzer:innen können Feature-Wünsche einreichen und liken; Admin-Bereich zur Verwaltung inkl. Tags und Admin-Nachrichten, Begrenzung offener Wünsche pro Nutzer, Löschen eigener unbestätigter Wünsche
- Modulhandbuch-Auto-Update: Abgleich-Dialog bei Änderungen am Modulhandbuch, unterschiedliche Kartenansichten für alte, neue und nutzergenerierte Module, Auswahl der passenden Modulgruppe beim Import
- Neues generisches Chart-System auf Basis von Apache ECharts (ersetzt ng2-charts und D3) für Dashboard-Widgets und die Kompetenz-Visualisierung im BilApp-Modul (Balken-, Donut-, Linien- und Boxplot-Charts)
- Studienplan-Einstellungen werden jetzt persistiert (u. a. Notenanzeige-Option)
- Modul-LV-Verknüpfung (Admin): Umschalter zwischen den Modulen des geladenen Modulhandbuchs und allen Modulen über alle Modulhandbuch-Versionen hinweg – dort je Modul nur ein Eintrag ohne Version, eine Änderung wirkt für alle Versionen
- Modul-LV-Verknüpfung (Admin): Filter nach Angebotssemester (Alle, nur WS, nur SS, passend zum gewählten Semester)
- Modul-LV-Verknüpfung (Admin): Der Bearbeiten-Dialog sucht beim Öffnen automatisch nach dem Titel der Modul-LV sowie nach Titel und Akronym des zugehörigen Moduls und zeigt diese Modulinfos in der Kopfzeile an
- Modul-LV-Verknüpfung (Admin): Während Daten geladen werden, liegt ein Spinner über dem Board und die Filter sind gesperrt, damit nicht auf einem veralteten Stand weitergearbeitet wird. Im Dialog sind die Verknüpfen-/Lösen-Schaltflächen gesperrt, solange ein Schreibvorgang läuft
- Auslieferung der Anwendung pro Sprache unter eigenem Präfix (`/de`, `/en`): lokalisierter
  Angular-Build und passende Rewrite-Regeln im Apache-Container
- Sprachumschalter im Kopfbereich; die Wahl wird im Cookie `baula_locale` festgehalten
- Optionale Umgebungsvariable `DEFAULT_LOCALE` (Standard `de`) für URLs ohne Sprachpräfix

### Changed
- Framework-Update: Angular auf Version 22 (inkl. Angular Material, NgRx 22), Umstellung auf das `inject()`-Pattern und die neue `@if`/`@for`-Control-Flow-Syntax
- Barrierefreiheit verbessert: Alt-Texte für Bilder ergänzt, Farbkontraste erhöht, Konsolen-Warnungen durch veraltete `@for`-Syntax behoben
- Modul-LV-Verknüpfung (Admin): Die Verknüpfungen eines Semesters werden über einen neuen Sammel-Endpunkt in einer einzigen Abfrage geladen statt mit einer Anfrage pro Modul
- Modul-LV-Verknüpfung (Admin): Der Sammel-Endpunkt liefert nur noch die Ids der Verknüpfungen; Kurs und Modul-LV wurden bisher pro Verknüpfung mitgeschickt, obwohl die Seite alle Kurse des Semesters ohnehin lädt. Der Kursbestand wird außerdem nur noch bei einem Semesterwechsel neu geholt, nicht mehr nach jeder Änderung im Dialog
- Indizes auf `Course.semester` und `Course2ModuleCourse.semester` ergänzt – beide Primärschlüssel beginnen mit einer anderen Spalte, ein Filter allein auf das Semester musste deshalb die komplette Tabelle lesen
- Die Semesterauswahl im Admin-Bereich zeigt jetzt ein Fenster um das aktuelle Semester, statt fest bei Sommersemester 2022 zu beginnen
- Der Shibboleth-Login behält die Sprache: das Sprachkürzel wird als `RelayState` durch den IdP
  geschleust und bestimmt das Ziel der Weiterleitung nach Login, Login-Fehlschlag und Logout
- Deployment löscht `server/app/browser` vor dem Kopieren, damit keine Dateien älterer Builds
  unter demselben DocumentRoot liegen bleiben

### Fixed
- Fehler beim Hinzufügen von Modulen, wenn zwei Module denselben Namen haben
- Notenfeld im Bearbeiten-Dialog ist jetzt korrekt optional
- Diverse kleinere Bugs bei Kursauswahl, FlexNow-Import für lokale Nutzer und Modulgruppen-Zuweisung
- Prüfungsbemerkung wurde beim FlexNow-Import nie übernommen (falscher XPath auf ein Element mit Kindknoten); anerkannte Leistungen hießen im Studienverlauf dadurch nur „-1“, „-2“ statt „Anerkannte Leistung-1“
- Der Semesterabschluss verwarf die Prüfungsversuche, die im Stepper selbst über „Mit FlexNow abgleichen“ geholt worden waren
- Modul-LV-Verknüpfung (Admin): Ein Semesterwechsel wirkte nur auf den Lehrveranstaltungs-Bestand, nicht auf das Board – dadurch zeigte der Dialog die zugeordneten Lehrveranstaltungen nicht mehr an und neue Verknüpfungen schienen sofort wieder zu verschwinden
- Modul-LV-Verknüpfung (Admin): Das Schließen des Dialogs lädt das Board nur noch neu, wenn tatsächlich eine Verknüpfung geändert wurde
- Modul-LV-Verknüpfung (Admin): Module ohne hinterlegten Lehrstuhl öffneten einen leeren Dialog
- Modul-LV-Verknüpfung (Admin): Die Listen im Board und im Dialog wurden über die Objektidentität verfolgt, wodurch Angular bei jedem Laden das gesamte DOM verwarf und neu aufbaute (NG0956). Sie tracken jetzt über stabile Schlüssel
- `GET /baula/module-handbooks/modules` war nie erreichbar: Die Route wurde erst nach `/:id` registriert und deshalb als Modulhandbuch mit der Id „modules“ gelesen, was mit „No module handbook could be found with the given id“ fehlschlug. Die Modulhandbuch-Platzhalterrouten stehen jetzt am Ende des Routers
- Nach dem Shibboleth-Logout erscheint keine leere Bestätigungsseite mehr, sondern die Startseite
  in der jeweiligen Sprache
- Apache liefert `3rdpartylicenses.txt` wieder aus (Alias zeigte auf einen falschen Pfad)

### Security
- Passport-SAML-Konfiguration überarbeitet (u. a. `wantAssertionsSigned` aktiviert)

## [1.0.0] - 2025-12-12 [released]
### Added
- initialize open source repo for baula