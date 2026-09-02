# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]
### Added
- FlexNow-Integration: automatisierter Noten-/Modul-Import aus FlexNow, inkl. Abgleich mit bereits abgeschlossenen Modulen, Lade-Anzeige während des Imports
- Prüfungsversuche werden aus FlexNow importiert und gespeichert: je Modul die gesamte Historie mit Semester, Versuchsnummer, Note und Prüfungsbemerkung. Wiederholungsversuche gehen damit nicht mehr verloren – bisher überlebte nur das Ergebnis der jüngsten Ablegung. Angezeigt wird die Historie noch nicht
- Jeder Prüfungsversuch merkt sich seine Herkunft (FlexNow oder selbst eingetragen); ein erneuter Abgleich ersetzt nur die zuvor importierten Versuche
- Feature-Wunsch-Widget: Nutzer:innen können Feature-Wünsche einreichen und liken; Admin-Bereich zur Verwaltung inkl. Tags und Admin-Nachrichten, Begrenzung offener Wünsche pro Nutzer, Löschen eigener unbestätigter Wünsche
- Modulhandbuch-Auto-Update: Abgleich-Dialog bei Änderungen am Modulhandbuch, unterschiedliche Kartenansichten für alte, neue und nutzergenerierte Module, Auswahl der passenden Modulgruppe beim Import
- Neues generisches Chart-System auf Basis von Apache ECharts (ersetzt ng2-charts und D3) für Dashboard-Widgets und die Kompetenz-Visualisierung im BilApp-Modul (Balken-, Donut-, Linien- und Boxplot-Charts)
- Studienplan-Einstellungen werden jetzt persistiert (u. a. Notenanzeige-Option)

### Changed
- Framework-Update: Angular auf Version 22 (inkl. Angular Material, NgRx 22), Umstellung auf das `inject()`-Pattern und die neue `@if`/`@for`-Control-Flow-Syntax
- Barrierefreiheit verbessert: Alt-Texte für Bilder ergänzt, Farbkontraste erhöht, Konsolen-Warnungen durch veraltete `@for`-Syntax behoben

### Fixed
- Fehler beim Hinzufügen von Modulen, wenn zwei Module denselben Namen haben
- Notenfeld im Bearbeiten-Dialog ist jetzt korrekt optional
- Diverse kleinere Bugs bei Kursauswahl, FlexNow-Import für lokale Nutzer und Modulgruppen-Zuweisung
- Prüfungsbemerkung wurde beim FlexNow-Import nie übernommen (falscher XPath auf ein Element mit Kindknoten); anerkannte Leistungen hießen im Studienverlauf dadurch nur „-1“, „-2“ statt „Anerkannte Leistung-1“
- Der Semesterabschluss verwarf die Prüfungsversuche, die im Stepper selbst über „Mit FlexNow abgleichen“ geholt worden waren

### Security
- Passport-SAML-Konfiguration überarbeitet (u. a. `wantAssertionsSigned` aktiviert)

## [1.0.0] - 2025-12-12 [released]
### Added
- initialize open source repo for baula