

# README Steps
### CHECK_VERSIONS
Stellt sicher, dass node und npm Versionen den Anforderungen entsprechen.
### CREATE_CONFIG_AND_ENV
Erstellt folgende Dateien mit platzhalter Inhalten:
- .env
- ./backend/api/environment/.env.backend
- ./backend/api/src/database/.env
- ./frontend/src/environments/config.local.ts
- ./frontend/src/environments/environment.ts
### INSTALL_NPM_DEPENDENCIES
Benutzt 'npm install' in folgenden Verzeichnissen:
- ./backend/api
- ./frontend
### CREATE_CERTS
Erstellt folgende Cert Dateien (mit NICHT validen Inhalt):
- ./backend/api/src/certs/idp_cert.pem
- ./backend/api/src/certs/sp_cert.pem
- ./backend/api/src/certs/sp_key.pem
### CREATE_REDIS
Erstellt folgende Datei:
- ./backend/api/src/database/redis-users.acl
### CREATE_TEMPLATES
Erstellt folgende Dateien mit platzhalter Inhalten:
- ./backend/api/src/templates/student-fn2api.ts
- ./backend/api/src/templates/mhb-fn2mod.ts
### CREATE_LOCAL_USERS
Erstellt folgende Datei mit platzhaler Inhalt:
- ./backend/api/src/shared/constants/users.ts
### HANDLE_DOCKER
Führt folgenden Befehl aus:
- npm run startLocalDocker
### LOAD_MARIADB_DUMP
Funktioniert momentan noch nicht.
### BUILD_PRISMA_CLIENT
Führt folgenden Befehl aus:
- npm run updateDB


# Production Build Steps
### PROD_CREATE_ENV
Erstellt folgende Dateien mit platzhalter Inhalten:
- ./frontend/src/environments/environment.prod.ts
- ./frontend/src/environments/config.prod.ts
### PROD_BUILD_BACKEND
Führt folgenden Befehl aus:
- npm run buildBackend
### PROD_BUILD_DOCS
Führt folgenden Befehl aus:
- npm run buildUserDocs
### PROD_BUILD_FRONTEND
Führt folgenden Befehl aus:
- npm run buildFrontendProd
### PROD_START_DOCKER
Führt folgenden Befehl aus:
- npm run startServerDocker
### PROD_COPY_FILES
Es muss COPY_PATH als Umgebungsvariable definiert sein. Z.B. kann 'COPY_PATH=/home/files/ npm run buildInitial PROD_COPY_FILES' benutzt werden.
Es werden folgende Dateien kopiert (Format: NAME_DER_DATEI: WOHIN_DIE_DATEI_KOPIERT_WIRD):
#### .env Dateien
- .env: ./
- .env.backend: ./backend/api/environment/.env.backend
- database.env: ./backend/api/src/database/.env
#### Konfigurations Dateien
- environment.prod.ts: ./frontend/src/environments/environment.prod.ts
- config.prod.ts: ./frontend/src/environments/config.prod.ts
#### Redis
- redis-user-acl: ./backend/api/src/database/redis-users.acl
#### Templates
- student-fn2api.ts: ./backend/api/src/templates/student-fn2api.ts
- mhb-fn2mod.ts: ./backend/api/src/templates/mhb-fn2mod.ts
#### Vorderfinierte Nutzer
- user.ts: ./backend/api/src/shared/constants/users.ts
#### Zertifikate
- idp_cert.pem: ./backend/api/src/certs/idp_cert.pem
- sp_cert.pem: ./backend/api/src/certs/sp_cert.pem
- sp_key.pem: ./backend/api/src/certs/sp_key.pem

# Check Services Steps
## Allgemein
Dieser Schritt geht davon aus, dass die Docker Container gestartet wurden. Die Namen der Docker Container sollten wie folgt aussehen:
- baula-python
- baula-server
- mongo
- redis:alpine
- mariadb
- baula-rest_api

Der 'Health Check' funktioniert, indem mit 'docker exec -it ID COMMAND' ein relevanter Befehl ausgeführt wird, welcher Informationen über den Status des Docker Containers liefern soll.
### CHECK_API_PYTHON
Die 'docker logs' von 'baula-python' werden dannach untersucht, ob sie 'Application startup complete' enthalten. Wenn ja, gilt der Service als 'running'.
### CHECK_API_NODE
Innerhalb des Docker Containers 'baula-rest_api' wird 'pm2 status' aufgerufen. Der Status muss die zwei entsprechenden Services enthalten und als 'online' ansehen. Wenn dies der Fall ist, gilt der Service als 'running'.
### CHECK_APACHE
Innerhalb des Docker Containers 'baula-server' wird 'apche2ctl fullStatus' und 'apache2ctl configtest' ausgeführt. 
Innerhalb des Status wird der Output von 'apache2ctl fullStatus' in 'Status.status' gespeichert und der Output von 'apache2ctl configtest' in 'Status.message' gespeichert.
Wenn 'apache2ctl configtest' 'Syntax OK' enthält, gilt der Service als 'running'. 
### CHECK_MONGO
Das 'docker inspect' von 'mongo' wird nach dem '.State' untersucht. Wenn '.State.Running' true ist, gilt dieser Service als 'running'.
### CHECK_REDIS
Von dem Docker Container 'redis:alpine' werden die 'docker logs' und 'docker exec ... redis-cli info' genommen. 
Der Output von den logs ist in Status.message und der Output von der redis-cli in Status.status.
Wenn die logs 'Ready to accept connections' enthalten, gilt der Service als 'running'. 
### CHECK_MARIADB
Von der Docker Container 'mariadb' werden die 'docker logs' untersucht.
Die logs werden in Status.message gespeichert.
Wenn die logs 'mariadbd: ready for connections' enthalten, gilt der Service als 'running'.
### CHECK_ALL
Checkt alle Services, wie oben aufgeführt. Gibt am Schluss eine Übersicht zurück.