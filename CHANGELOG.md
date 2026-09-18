# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Auslieferung der Anwendung pro Sprache unter eigenem Präfix (`/de`, `/en`): lokalisierter
  Angular-Build und passende Rewrite-Regeln im Apache-Container
- Sprachumschalter im Kopfbereich; die Wahl wird im Cookie `baula_locale` festgehalten
- Optionale Umgebungsvariable `DEFAULT_LOCALE` (Standard `de`) für URLs ohne Sprachpräfix

### Changed
- Der Shibboleth-Login behält die Sprache: das Sprachkürzel wird als `RelayState` durch den IdP
  geschleust und bestimmt das Ziel der Weiterleitung nach Login, Login-Fehlschlag und Logout
- Deployment löscht `server/app/browser` vor dem Kopieren, damit keine Dateien älterer Builds
  unter demselben DocumentRoot liegen bleiben

### Fixed
- Nach dem Shibboleth-Logout erscheint keine leere Bestätigungsseite mehr, sondern die Startseite
  in der jeweiligen Sprache
- Apache liefert `3rdpartylicenses.txt` wieder aus (Alias zeigte auf einen falschen Pfad)

## [1.0.0] - 2025-12-12 [released]
### Added
- initialize open source repo for baula