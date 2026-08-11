# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- FlexNow-Integration: automatisierter Noten-/Modul-Import aus FlexNow, inkl. Abgleich mit bereits abgeschlossenen Modulen, Lade-Anzeige während des Imports
- Feature-Wunsch-Widget: Nutzer:innen können Feature-Wünsche einreichen und liken; Admin-Bereich zur Verwaltung inkl. Tags und Admin-Nachrichten, Begrenzung offener Wünsche pro Nutzer, Löschen eigener unbestätigter Wünsche
- Modulhandbuch-Auto-Update: Abgleich-Dialog bei Änderungen am Modulhandbuch, unterschiedliche Kartenansichten für alte, neue und nutzergenerierte Module, Auswahl der passenden Modulgruppe beim Import
- Neues generisches Chart-System auf Basis von Apache ECharts (ersetzt ng2-charts und D3) für Dashboard-Widgets und die Kompetenz-Visualisierung im BilApp-Modul (Balken-, Donut-, Linien- und Boxplot-Charts)
- Studienplan-Einstellungen werden jetzt persistiert (u. a. Notenanzeige-Option)

### Changed
- Framework-Update: Angular auf Version 21 (inkl. Angular Material, NgRx 21), Umstellung auf das `inject()`-Pattern und die neue `@if`/`@for`-Control-Flow-Syntax
- Barrierefreiheit verbessert: Alt-Texte für Bilder ergänzt, Farbkontraste erhöht, Konsolen-Warnungen durch veraltete `@for`-Syntax behoben

### Fixed
- Fehler beim Hinzufügen von Modulen, wenn zwei Module denselben Namen haben
- Notenfeld im Bearbeiten-Dialog ist jetzt korrekt optional
- Diverse kleinere Bugs bei Kursauswahl, FlexNow-Import für lokale Nutzer und Modulgruppen-Zuweisung

### Security
- Passport-SAML-Konfiguration überarbeitet (u. a. `wantAssertionsSigned` aktiviert)

## [1.0.0] - 2025-12-12 [released]
### Added
- initialize open source repo for baula