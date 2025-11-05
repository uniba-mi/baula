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

##### n. Weitere Schritte TBD
Hier könnten noch weitere Schritte folgen, je nachdem wie stark wir unsere .gitignore erweitern. Denkbar wäre z. B. die `constants.ts` in der die Nutzer definiert sind nicht mehr zu pushen. Diese müsste dann angelegt werden. 
Hier eine mögliche Liste von Dateien, die ausgelagert werden könnten:
- `./backend/api/src/shared/constants/*`
- `./backend/api/src/templates/*` wobei die für ein initiales Setup nicht nötig sind, nur bei Import von XML
- `./frontend/src/environments/*` wobei da eigentlich nicht wirklich sensible Informationen enthalten sind

### Projektstruktur


### API-Dokumentation


### Deployment
npm install -g retypeapp

### Lizenz und Credits
[Lizenz](LICENCE.md)
<a class="link" href="https://storyset.com/data">Data illustrations by Storyset</a>
