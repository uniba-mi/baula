# Backend
**Version** 2.0.0
### Aufbau der Ordnerstruktur:
* `/backup` enthält aktuellen Datenbankdump zum Aufsetzen der Strukturdaten (MariaDB)
* `/dist` enthält die gebauten Files für den Server
* `/environment` enthält die relevanten env-Variablen (NEU: vorher waren die verteilt, zudem sollten drei Varianten .env.local, .env.production, .env.test vorliegen). Beispielhaft könnte eine Datei wie folgt aussehen:

        ## Local Setting .env.local
        NODE_ENV=local
        ORIGIN=http://localhost:4200
        SESSION_SECRET=cf83e1357eefb8bdf1542850d66d8007d620e4130b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e
        SAML_ENTRY_POINT=https://idp.iam.uni-bamberg.de/idp/profile/SAML2/Redirect/SSO
        SAML_ISSUER=https://baula-test.minf.uni-bamberg.de/shibboleth
        SAML_CALLBACK_URL=https://baula-test.minf.uni-bamberg.de/Shibboleth.sso/SAML2/POST
        REL_DATABASE_URL=mysql://root:S+DiKuLe22&WegE19!@localhost:3307/Baula
        MONGO_DATABASE_URL=mongodb://root:S+DiKuLe22&WegE19!@localhost:27017/Baula?authSource=admin&retryWrites=true&w=majority
        REDIS_URL=redis://:test123@localhost:6379
        LOGIN_PAGE_URL=http://localhost:4200/login
        SESSION_NAME=HalloWelt
        COOKIE_SECURE=false

* `/mockdata` enthält Mockdata bzw. Datenbestände, welche initial im Frontend eingeladen werden müssen (z.B. die Dateien im Unterordern `/mockdata/xml`).
* `/recData` enthält nach Studiengang geordnet die Informationen für den "Beliebt"-Teil in der Empfehlungskomponente (jeweils `{spId}_common_passes.json`) sowie für die Zusatzinfos in den Moduldetails und beim Hinzufügen eines Moduls über die Studienverlaufskomponente (jeweils `{spId}_module_data.json`).
* `/python` enthält externe Python Dateien. Enthält eine *extra* README.md. Läuft mit im Docker und hat ein eigenes Dockerfile.
* `/src` enthält alle relevanten Codeteile für die API
  * `/certs` enthält die Zertifikate für den Shib-Login
  * `/cron` enthält das Skripte für den automatischen UnivIS-Crawl.
  * `/database` enthält die Schema-Datei zu Prisma und die `mongo.ts`. In dieser wird die Verbindung zur MongoDB aufgebaut, die Schema und Modelle erstellt und entsprechend exportiert. Zusätzlich enthält der Ordner eine persönliche .env-Datei, welche individuell angelegt werden muss und die `REL_DATABASE_URL` und `MONGO_DATABASE_URL` enthält. Diese ist der Verbindungslink zur laufenden MySQL-Datenbank und zur MongoDB.
  Bsp:

        REL_DATABASE_URL=mysql://root:S+DiKuLe22&WegE19!@localhost:3307/Baula
        MONGO_DATABASE_URL=mongodb://root:S+DiKuLe22&WegE19!@localhost:27017/Baula?authSource=admin&retryWrites=true&w=majority
        
  * `/routes` enthält die Implementierung der verschiedenen REST-API Routen (z.B. `/mhb`). Diese werden über Namespaces in die `app.ts` eingebunden wodurch diese entschlackt wird.
  * `/shared` enthält Hilfsfunktionen wie z.B. Errorhandling, Modulzuordnung etc.
  * `/templates` enthält verschiedene Hilfsdateien. U.a. sind hier Hilfsklassen um die Ausgabe der Studiengangsstruktur zu erstellen und verschiedene Template-Dateien für das Transformieren der XML-Dateien in JSON (via `camaro` - für den FN2Mod-Mhb-Import und den UnivIS-Import).
  * Die `app.ts` enthält die eigentliche Keranwendung (hier werden alle Dateien verknüpft)
* `pm2.config.js` ist die Konfigurationsdatei für PM2 (nur für Server) 

### Einrichten des Backends
* Zunächst sollte sichergestellt sein, dass via `npm install` alle relevanten Pakete installiert sind.
* Außerdem sollte ein MySQL-Server auf den Port 3306 (individuell in der .env-Datei im Hauptverzeichnis bestimmen) hören und eine Datenbank (z.B. baula) enthalten, ähnliches gilt für die MongoDB.
* Anschließend sollte die nötige `.env`-Dateien erstellt und mit passenden Daten gefüllt werdern (im Ordner `/environment`, näheres siehe oben).
* Über den Befehl `npm run updateDB` wird mit Hilfe der `schema.prisma`-Datei das grundlegende Datenbankschema in die referenzierte Datenbank übertragen. 
* Um die REST-API zu starten, kann der Befehl `npm run startServer` ausgeführt werden. Die API ist anschließend auf dem Port 3305 erreichbar (http://localhost:3305).
* Um diese Datenbank mit Daten zu füllen, können die Daten im Haupt-Verzeichnis unter `/data/backup` in die Datenbank geladen werden. Am besten öffnet man über `docker exec` die Bash des jeweiligen RelDB-Docker-Containers und navigiert dort in das Verzeichnis `/backend` und lädt den Dump in die Datenbank.
* Damit in der Semesterplan-Komponente Daten zu UnivIS angezeigt werden, müssen zudem die Daten zunächst gecrawlt werden. Hierzu im Admin-Bereich `/admin` das entsprechende Semester (am besten nicht in der Zukunft liegende Semester) und den Crawlprozess starten. !Vorsicht! Der Prozess kann etwas dauern. Sollte nach über 5 Minuten aber nichts passiert sein, mal nach Fehlern suchen.

### Styleguide für Benennung von Routen
* konsistente Aufteilung in Subrouten für die einzelnen Bereiche -> hierzu könnten wir auch noch eine eigenständig Guideline erstellen, ob man sich hier z.B. nach der Datenbankstruktur orientiert
* konsistente Verwendung von _get_ um Daten abzufragen, _post_ um Daten zu erzeugen, _put_ um Daten zu aktualisieren und _delete_ um Daten zu entfernen. Dabei auch keine Wiederholung des Typs in der Route sondern lediglich über HTTP-Request-Typ steuern.
* kein CamelCase in Routen sondern zur besseren Lesbarkeit Bindestriche (-) verwenden.
* Konsistente Benennung von mehreren Items mit Plural und einzelnen Items mit Singular -> router.get('/all/mod*S*', getAllModules);
