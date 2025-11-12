# Baula
#### Bamberger Assistentin zur Unterstützung der Lehrveranstaltungskoordination und -Auswahl

**Version:** 2.2.0

### Inhaltsverzeichnis
1. [Überblick](#überblick)
2. [Setup und Installation](#setup-und-installation)
3. [Projektstruktur](#projektstruktur)
4. [API-Dokumentation](#api-dokumentation)
5. [Deployment](#deployment)
6. [Changelog](CHANGELOG.md)
7. [Lizenz und Credits](#lizenz-und-credits)

### Überblick
Dieses Repo dokumentiert den Quellcode des digitalen Studienplanungsassistenten Baula, welcher am Lehrstuhl für Medieninformatik der Universität Bamberg seit 2022 in verschiedenen Forschungsprojekten entwickelt und beforscht wird. 

### Setup und Installation
Hier sind die Schritte dokumentiert um Baula lokal zu starten.
##### 1. Anlegen der .env-Dateien
- im root Verzeichnis muss eine `.env` angelegt werden. Diese .env Datei ist die Basis für den Start der Docker-Container. Die gesetzen Informationen (Nutzernamen und Passwörter) sind für den späteren Zugriff relevant. Die .env sollte folgende Informationen enthalten:
    ```bash
    # .env
    # required information 
    MONGO_USERNAME=root # user for mongodb
    MONGO_PASSWORD=password # passowrd for mongodb
    RELDB_ROOT_PW=password # root password for mariadb
    RELDB_USER=user # additional user for accessing the mariadb
    RELDB_PASSWORD=password # password for additional user
    RELDB_DATABASE=dbname # database name in mariadb
    DOCS_PORT=4201 # port where docs should be available

    # only for deployment on server
    SERVER_PORT_SSL=443 # ssl port on the server
    SERVER_PORT=80 # regular port on the server
    HOSTNAME=localhost # replace localhost by hostname (e.g. domain)
    HOST_URL=https://localhost # replace localhost by domain
    API_PORT=1234 # port where backend is served
    ```
- unter `./backend/api/environment/` muss ebenfalls eine `.env.backend` angelegt werden. Diese enthält die Umgebungsvariablen für die API. Folgende Informationen müssen enthalten sein:
    ```bash
    # .env.backend 
    NODE_ENV=local
    ORIGIN=http://localhost:4200
    SESSION_SECRET=firstsecret
    SAML_ENTRY_POINT=https://idp.test.de/idp/profile/SAML2/Redirect/SSO # entry point of your idp
    SAML_ISSUER=https://sp.test.de/shibboleth # entity id of your sp
    SAML_CALLBACK_URL=https://sp.test.de/Shibboleth.sso/SAML2/POST # callback url of your sp
    MONGO_DATABASE_URL=mongodb://root:password@localhost:27017/Baula?authSource=admin&retryWrites=true&w=majority
    REDIS_URL=redis://test:test123@localhost:6379
    SESSION_ENC_KEY=anothersecret
    LOGIN_PAGE_URL=http://localhost:4200/login
    DASHBOARD_URL=https://test.de/app/
    COOKIE_SECURE=false
    SESSION_NAME=yourSessionName
    TEST_USER=user
    ADMIN_USER=admin
    TEST_PW=secretPassword
    ADMIN_PW=safePassword
    ```
- zuletzt muss unter `./backend/api/src/database` eine `.env` angelegt werden. Diese ist nur für die Verbindung von Prisma mit der MariaDB nötig. Daher sind lediglich folgende Informationen nötig:
    ```bash
    # .env
    REL_DATABASE_URL=mysql://user:password@localhost:3306/dbname
    ```

##### 2. Installieren der Dependencies
Abhängigkeiten im `./backend/api` und `./frontend` mit Hilfe von `npm install` installieren.

##### 3. Certs-Files anlegen
Im Ordner `./backend/api/src/certs` werden drei Dateien nötig, für ein lokales Setting können diese leer sein und müssen nur vorhanden sein. Dafür folgende Dateien anlegen: 
- `idp_cert.pem`
- `sp_cert.pem`
- `sp_key.pem`

##### 4. Redis-User Datei anlegen
Im Ordner `./backend/api/src/database` muss eine Datei `redis-users.acl` angelegt werden. Die Datei dient dazu Nutzer für die Session-Datenbank Redis anzulegen und damit die Default-User zu überschreiben:
```bash
    # redis-users.acl
    user default off
    user test on >test123 ~* +@all
```

##### 5. Dockercontainer starten
In der lokalen Umgebung muss der Befehl `npm run startLocalDocker` ausgeführt werden.

##### 6. Dump in MariaDB laden
Damit die Anwendung regulär verwendet werden kann, müssen die Strukturdaten in der MariaDB initial über einen Dump importiert werden. Der im Repo hinterlegte Dump wird dabei in den MariaDB-Container in das Verzeichnis `/backups` gemountet. Zum Import des Containers also folgende Befehle ausführen:
```bash
    # 1. Zugriff auf MariaDB-Dockercontainer
    docker exec -it baula-mariadb-1 bash
    # 2. In den Backup-Ordner navigieren
    cd /backups 
    # 3. Dump einspielen
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -D"$MYSQL_DATABASE" < test_backup.sql
```

##### 7. Prisma Client bauen
TBD
* Über den Befehl `npm run updateDB` wird mit Hilfe der `schema.prisma`-Datei das grundlegende Datenbankschema in die referenzierte Datenbank übertragen. 

##### 8. Frontend und Backend starten
Nun sollte alles eingerichtet sein, so dass man über die folgenden Befehle Baula sowie die API starten kann. Beide Befehle müssen im root-Verzeichnis ausgeführt werden.
```bash
    npm run startFrontend # startet Frontend auf Port 4200
    npm run startBackend # startet Backend auf Port 3305
```

##### n. Weitere Schritte TBD
Hier könnten noch weitere Schritte folgen, je nachdem wie stark wir unsere .gitignore erweitern. Denkbar wäre z. B. die `constants.ts` in der die Nutzer definiert sind nicht mehr zu pushen. Diese müsste dann angelegt werden. 
Hier eine mögliche Liste von Dateien, die ausgelagert werden könnten:
- `./backend/api/src/shared/constants/*`
- `./backend/api/src/templates/*` wobei die für ein initiales Setup nicht nötig sind, nur bei Import von XML
- `./frontend/src/environments/*` wobei da eigentlich nicht wirklich sensible Informationen enthalten sind

### Projektstruktur
- `/backend` enthält alles zum Abruf der relevanten Daten für das Frontend. Neben der mit Express.js erstellten REST-API ist hier der Python-Code verortet. Näheres ist in der spezifischen [README](./backend/README.md).
- `/data` primär werden hier die Daten aus den DB-Containern persistiert, welche aber nicht in das Repo gepusht werden. Unter `/data/backups/mariadb` bzw. `/data/backups/mongodb` können Dump-Files hinterlegt werden, welche anschließend in den jeweiligen DB-Container gemountet werden. `/data/backups/mariadb` enthält dabei den initialen Dump, der importiert werden muss um Baula initial zu starten.
- `/documentation` enthält alle Dateien für die Nutzer- und Developer-Dokumentation zu Baula, welche mit Retype erstellt ist. Wichtig für das Deployment ist, dass der Ordner `.retype` enthalten ist, da dort die statisch gebauten Dateien liegen, welche in den Server-Container gemountet werden.
- `/frontend` enthält die Kern-Codebasis von Baula in Form des Angular Projekts: Näheres ist in der spezifischen [README](./frontend/README.md) erklärt
- `/interfaces` hier sind die gemeinsamen Interfaces und Klassen, welche von Frontend und Backend genutzt werden enthalten.
- `/server` wir nur für die Bereitstellung auf einem Server benötigt. Hier werden in `/apache2` die Servereinstellungen gesetzt, welche in den Server-Container gemountet werden. Der Ordner `/app` wird beim Build des Frontend mit der gebauten Angular-App befüllt und anschließend in das `/var/www`-Verzeichnis des Server-Containers gemountet.
- `.env` enthält wie unter [Setup und Installation](#setup-und-installation) beschrieben die Umgebungsvariablen für den Start der Docker-Umgebung.
- `.gitignore` enthält die ausgeschlossenen Verzeichnisse und Dateien.
- `CHANGELOG.md` hier werden die wichtigsten Neuerungen bei Versionsupdates dokumentiert.
- `docker-compose.yml` beinhaltet die Konfiguration der notwendigsten Docker Container für lokales Development-Setting und Serverbetrieb (z. B. DB-Docker).
- `docker-compose.override.yml` ist speziell für die lokale Entwicklung und überschreibt einzelne Aspekte der allgemeinen Konfiguration in der `docker-compose.yml`. Bspw. wird `expose` durch ein Portmapping ersetzt, da lokal Frontend und Backend nicht über das Docker-Netzwerk kommunizieren und `expose` die Container nur darin zugänglich macht. 
- `docker-compose.server.yml` beinhaltet die Konfiguration zusätzlicher Docker Container, welche nur im Serverbetrieb nötig sind (z. B. Apache2-Docker)
- `package.json` primär dazu da die zentralen Befehle zu dokumentierung und über `npm run` ansteuerbar zu gestalten. U.a. werden hier die Skripte zum Start der Dockerumgebung, dem Frontend und Backend sowie die Build-Prozesse hinterlegt. Die wichtigsten Befehle sind:
    - `restartLocalDocker` bzw. `restartServerDocker`: wird benötigt um den Docker Container lokal bzw. auf dem Server neuzustarten
    - `startBackend`: startet das Backend für die lokale Entwicklung
    - `startFrontend`: startet das Frontend für die lokale Entwicklung
    - `buildTest`: Baut Frontend, Backend und Doku für das Deployment auf einem Testsystem. 
    - `buildProd`: Baut Frontend, Backend und Doku für das Deployment auf einem Produktivsystem. Primärer Unterschied sind die geladenen Umgebungsvariablen für das Frontend, welche u.a. auch Debugging-Tools steuern.

### API-Dokumentation
TBD -> Link auf Swagger Doku

### Deployment
TBD
Voraussetzungen:
- npm install -g retypeapp
- Angular (ng) installiert?

Vorgehen:
- Wichtig: prod -> main | test -> develop
- npm run buildTest bzw. npm run buildProd
- Stand pushen und auf Server anmelden
- auf Server pullen und docker neustarten
- Bei Änderungen im Frontend muss nicht neu gestartet werden. Für einen Soft Restart kann auch auf dem backend-Docker nur die API neu gestartet werden (nicht möglich bei Version updates oder Datenbank-Änderungen)



### Lizenz und Credits
[Lizenz](LICENCE.md)

<a class="link" href="https://storyset.com/data">Data illustrations by Storyset</a>
