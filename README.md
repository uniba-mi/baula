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
##### 0. Requirements
Um Baula lokal starten zu können ist die Installation von [Node.js](https://nodejs.org/en) inklusive des Node-Package-Manager (npm) sowie die [Angular CLI](https://angular.dev/tools/cli). 
Folgende Versionen sind die Minimalvoraussetzungen:
- Node.js >= 24.10.0 
- npm >= 11.6.2
- Angular CLI >= 20.3.6

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
    PYTHON_URL=http://localhost
    SESSION_ENC_KEY=OYgZjzXvk1dVmLSGE41ziK5jNhyoXxTFC2SEa3+hWTo= #key size must be 32 bytes in base64
    LOGIN_PAGE_URL=http://localhost:4200/login
    DASHBOARD_URL=https://test.de/app/
    COOKIE_SECURE=false
    SESSION_NAME=yourSessionName
    TEST_USER=user
    ADMIN_USER=admin
    TEST_PW=secretPassword
    ADMIN_PW=safePassword
    #Additional variables required for server environment when FlexNow integration is needed
    FLEXNOW_LOGIN=user
    FLEXNOW_PW=superSecret123
    FN_MHBS_URL=https://your-fn2-url.de/api/mhbs
    FN_STUDENT_URL=https://your-fn2-url.de/api/student
    FN_EXAM_URL_BASE=https://your-fn2-url.de/api/enroll

    ```
- unter `./backend/api/src/database` eine `.env` angelegt werden. Diese ist nur für die Verbindung von Prisma mit der MariaDB nötig. Daher sind lediglich folgende Informationen nötig:
    ```bash
    # .env
    REL_DATABASE_URL=mysql://user:password@localhost:3306/dbname
    ```
- für das Frontend müssen Config- und Environment-Dateien im Verzeichnis `./frontend/src/environments` angelegt werden. Hier ist auch das entsprechende Interface in der `config.interface.ts` definiert. Für jede Umgebung (local, test, prod) am besten eigenständige config-Dateien anlegen, beispielsweise könnte eine `config.local.ts` wie folgt aussehen:
    ```ts
    import { Config } from "./config.interface";

    export const config: Config = {
        homeUrl: 'http://localhost:4200', 
        apiUrl: 'http://localhost:3305/api/',
        loginUrl: 'http://localhost:3305/login/',
        shibLoginUrl: 'https://meine-domain.test/Shibboleth.sso/Login',
        localLogoutUrl: 'http://localhost:3305/logout', 
        shibLogoutUrl: 'https://meine-domain.test/Shibboleth.sso/Logout', 
        dashboardUrl: 'app/',
    }
    ```
    Für ein Deployment auf einem Server muss entsprechend die `ShibLoginUrl` und `ShibLogoutUrl` angepasst werden.
    Zusätzlich muss noch für jede Umgebung ein `environment.ts` (für prod z. B. dann `environment.prod.ts`) angelegt werden. Darin kann die Verfügbarkeit des Ngrx-Stores für Development-Zwecke konfiguriert oder eine Sentry-Domain hinterlegt werden. Hier eine beispielhafte `environment.ts`:
    ```ts
    import { StoreDevtoolsModule } from '@ngrx/store-devtools';

    export const environment = {
        production: false, // true for production
        imports: [
            StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: true, connectInZone: true })
        ],
        sentryDsn: 'https://my-sentry-link.test',
        nodeEnv: 'development', // set 'production' for public release
    };
    ```

##### 2. Installieren der Dependencies
Abhängigkeiten im `./backend/api` und `./frontend` mit Hilfe von `npm install` installieren.

##### 3. Certs-Files anlegen
Im Ordner `./backend/api/src/certs` werden drei Dateien nötig, für ein lokales Setting können die Dateien mit einem beliebigen Inhalt z. B. `test` gefüllt werden. Dafür folgende Dateien anlegen: 
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

##### 5. Template-Dateien anlegen
Baula bietet Schnittstellen zu verschiedenen universitären Systemen. Konkret umgesetzt sind derzeit FlexNow und UnivIS. Diese Schnittstellen werden angesteuert und die empfangenen Daten in unser Baula-Datenformat transformiert. Hierzu nutzen wir das npm-Paket `camaro`, welches mit Hilfe von XPath aus den XML-Eingaben definierte JSON-Ausgaben erzeugt. 
Nähere zum benötigten Datenschema ist in der [Backend-README](./backend/README.md). Ein Beispiel, wie eine solche Transformation aussieht findet sich in `/backend/api/src/templates/univis-template.ts`, welches dazu dient, die eingehenden XML-Daten der UnivIS-PRG-Schnittstelle in das Baula-Format zu transformieren.

Damit Baula lokal läuft, müssen die Template-Dateien alle verfügbar sein. Neben der `univis-template.ts` müssen noch folgende Dateien angelegt werden:
- `student-fn2api.ts`: Wird benötigt, um die Studenten-API von FlexNow anzusteuern. Näheres zu den benötigten Eigenschaften findet sich in der [Backend-Readme](./backend/README.md).
    ```ts
    // student-fn2api.ts
    export const studyPathTemplate = [];
    export const metaDataTemplate = [];
    ```
- `mhb-fn2mod.ts`: Wird benötigt, um die Modulhandbücher aus FlexNow zu importieren. Die nötigen Eigenschaften orientieren sich hier an den Schema-Definitionen in der `/backend/api/src/database/schema.prisma`.
    ```ts
    // mhb-fn2mod.ts
    export const depTemplate = [];
    export const personTemplate = [];
    export const spTemplate = [];
    export const mhbTemplate = [];
    export const mgTemplate = [];
    export const mcTemplate = [];
    export const modTemplate = [];
    export const modDepTemplate = [];
    export const moduleExamTemplate = [];
    export const sp2mhbTemplate = [];
    export const per2mcTemplate = [];
    export const mhb2mgTemplate = [];
    export const mg2mgTemplate = [];
    export const mg2modTemplate = [];
    export const m2mcTemplate = [];
    ```

Beide Dateien dürfen nicht leer sein und müssen die nötigen Templates exportieren, daher empfiehlt es sich für die lokale Entwicklung jeweiligen Beispiele einzufügen. Wichtig: Die zugehörigen Funktionen im Admin-Bereich funktionieren mit diesen nicht und müssen an die eingehende XML angepasst werden!

##### 6. Lokale Nutzer anlegen
In Baula gibt es zwei Möglichkeiten sich einzuloggen: 
1. Über Shibboleth. Benötigt wird ein Identity Provider (idp) sowie ein dort registrierter Service Provider (sp).
2. Über ein lokales Nutzerkonto. In Baula können beliebige lokale Nutzer angelegt und mit Rollen (student, demo, admin) versehen werden. Diese müssen in der Datei `users.ts` in `/backend/api/src/shared/constants` angelegt und die Zugangsdaten in der `.env.backend` hinterlegt werden (siehe Schritt 1). Hier eine beispielhafte `users.ts`:
    ```ts
    export const USERS = [
        {
            shibId: "10101010101010101010101010101010", // muss exakt 32 Zeichen lang sein
            username: process.env.USER,
            password: process.env.USER_PW,
            roles: ["student"], // die Rolle 'demo' würde dem Nutzer jegliche Schreibrechte nehmen
        },
        {
            shibId: "11010101010101010101010101010101",
            username: process.env.ADMIN_USER,
            password: process.env.ADMIN_PW,
            roles: ["student", "admin"],
        }
    ]
    ```

##### 7. Dockercontainer starten
In der lokalen Umgebung muss der Befehl `npm run startLocalDocker` ausgeführt werden.

##### 8. Dump in MariaDB laden
Damit die Anwendung regulär verwendet werden kann, müssen die Strukturdaten in der MariaDB initial über einen Dump importiert werden. Der im Repo hinterlegte Dump wird dabei in den MariaDB-Container in das Verzeichnis `/backups` gemountet. Zum Import des Containers also folgende Befehle ausführen:
```bash
    # 1. Zugriff auf MariaDB-Dockercontainer
    docker exec -it baula-mariadb-1 bash
    # 2. In den Backup-Ordner navigieren
    cd /backups 
    # 3. Dump einspielen
    mariadb -u root -p"$MYSQL_ROOT_PASSWORD" -D"$MYSQL_DATABASE" < initial_backup.sql
```

##### 9. Prisma Client bauen
* In das Verzeichnis `/backend/api` navigieren und dort `npm run generateDB` ausführen, um den Prisma Client zu bauen.
* Über den Befehl `npm run updateDB` wird mit Hilfe der `schema.prisma`-Datei das grundlegende Datenbankschema in die referenzierte Datenbank übertragen. 

##### 10. Frontend und Backend starten
Nun sollte alles eingerichtet sein, so dass man über die folgenden Befehle Baula sowie die API starten kann. Beide Befehle müssen im root-Verzeichnis ausgeführt werden.
```bash
    npm run startFrontend # startet Frontend auf Port 4200
    npm run startBackend # startet Backend auf Port 3305
```

##### 11. Initialisierung im Admin-Bereich
Damit der Personalisierungs-Tab funktioniert, müssen im Admin-Bereich (zugänglich über den Nutzer mit der Rolle "admin") die Modul- und Topic-Embeddings initialisiert werden. Diese finden sich im Admin-Bereich im Tab "Empfehlung". Näheres zum Admin-Tab findet sich in der [Backend-README](./backend/README.md).


### Projektstruktur
- `/backend` enthält alles zum Abruf der relevanten Daten für das Frontend. Neben der mit Express.js erstellten REST-API ist hier der Python-Code verortet. Näheres ist in der spezifischen [README](./backend/README.md).
- `/data` primär werden hier die Daten aus den DB-Containern persistiert, welche aber nicht in das Repo gepusht werden. Unter `/data/backups/mariadb` bzw. `/data/backups/mongodb` können Dump-Files hinterlegt werden, welche anschließend in den jeweiligen DB-Container gemountet werden. `/data/backups/mariadb` enthält dabei den initialen Dump, der importiert werden muss um Baula initial zu starten.
- `/documentation` enthält alle Dateien für die Nutzer- und Developer-Dokumentation zu Baula, welche mit Retype erstellt ist. Wichtig für das Deployment ist, dass der Ordner `.retype` im jeweilgen Dokumentationsordner enthalten ist, da dort die statisch gebauten Dateien liegen, welche in den Server-Container gemountet werden. Die Nutzer-Dokumentation befindet sich im Ordner `/documentation/user-docs` und die Developer-Dokumentation im Ordner `/documentation/developer-docs`.
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
Die Dokumentation der API ist nach Start des API-Servers unter der Route `/api/docs/baula` erreichbar.

### Deployment
TBD
Vorgehen:
- Wichtig: prod -> main | test -> develop
- npm run buildTest bzw. npm run buildProd
- Stand pushen und auf Server anmelden
- auf Server pullen und docker neustarten
- Bei Änderungen im Frontend muss nicht neu gestartet werden. Für einen Soft Restart kann auch auf dem backend-Docker nur die API neu gestartet werden (nicht möglich bei Version updates oder Datenbank-Änderungen)



### Lizenz und Credits
[Lizenz](LICENCE.md)

<a class="link" href="https://storyset.com/data">Data illustrations by Storyset</a>
