# Backend
### Aufbau der Ordnerstruktur:
* `/api` enthält alle Dateien für die REST-API
    * `/dist` enthält die gebauten Files für den Server
    * `/environment` enthält die `.env.backend` mit zentralen Umgebungsvariablen für das Backend
    * `/src` enthält alle relevanten Codeteile für die API
        * `/certs` enthält die Zertifikate für den Shib-Login
        * `/config` enthält Konfigurationsdateien zum Laden der .env-Datei (`env.config.ts`), Passport-Einstellungen (`passport-local.config.ts`, `passport-saml.config.ts` und `passport.config.ts`), Session-Einstellungen (`session.config.ts`) und Swagger (`swagger.config.ts`).
        * `/database` enthält die Schema-Datei zu Prisma und die `mongo.ts`. In dieser wird die Verbindung zur MongoDB aufgebaut, die Schema und Modelle erstellt und entsprechend exportiert.
        * `/logs` enthält die Logs von geworfenen Fehlern und den laufenden Cronjobs.
        * `/routes` enthält die Implementierung der verschiedenen REST-API Routen (z.B. `/mhb`). Diese werden über Namespaces in die `app.ts` eingebunden wodurch diese entschlackt wird. Jede Route besitzt eine `.controller.ts` (Logik) und eine `.router.ts` (Router).
        * `/services` enthält Services, welche über mehrere Routen hinweg verwendet werden.
        * `/shared` enthält Hilfsfunktionen wie z.B. Errorhandling, Modulzuordnung, Middleware etc.
        * `/templates` enthält verschiedene Hilfsdateien. U.a. sind hier Hilfsklassen um die Ausgabe der Studiengangsstruktur zu erstellen und verschiedene Template-Dateien für das Transformieren der XML-Dateien in JSON (via `camaro` - für den FN2Mod-Mhb-Import und den UnivIS-Import).
        * Die `app.ts` enthält die eigentliche Kernanwendung (hier werden alle Dateien verknüpft)
        * Die `server.ts` import das App-Objekt und startet die API.
    * `/staticdata` enthält alle statischen Dateien (primär JSON), welche an verschiedenen Stellen benötigt werden.
        * `/recData` enthält nach Studiengang geordnet die Informationen für den "Beliebt"-Teil in der Empfehlungskomponente (jeweils `{spId}_common_passes.json`) sowie für die Zusatzinfos in den Moduldetails und beim Hinzufügen eines Moduls über die Studienverlaufskomponente (jeweils `{spId}_module_data.json`).
        * `/studyplan_templates` enthält die Musterstudienpläne verschiedener Studiengänge. Hier müssen die zuvor in Baula erstellten und exportierten JSON Dateien der Musterverlaufspläne abgelegt werden, damit sie für neue Studierende auswählbar sind. Das Namensschema `muster_{spId}_{semester}.json`, wobei `spId` die Kennung des Studiengangs darstellt und `semester` das Semester im UnivIS Format (`yyyy(s|w)`).
    * `Dockerfile` beschreibt den Build-Prozess des Backend-Containers
    * `package.json` enthält die Abhängigkeiten sowie Build-Skripte, welche vom Root-Verzeichnis aus angesteuert werden und zusätzliche Skripte:
        * `build` & `copyFiles` werden im Root-Verzeichnis über die entsprechend build-Befehle adressiert.
        * `startApi` bzw. `startCronjob` (nur Server) werden im Root-Verzeichnis über den start-Befehl bzw. im Build-Prozess des Backend-Containers auf dem Server entsprechend mit `pm2` gestartet.
        * `generateDB` dient dazu, den Prisma-Client anzulegen (muss initial einmal aufgerufen werden)
        * `updateDB` synchronisiert das Prisma-Schema mit der Datenbank.[^1]
        * `resetDB` kann verwendet werden, um die Datenbank zu resetten. 
        * `startStudio` öffnet einen Web-Viewer von Prisma zum einfachen Inspizieren der Daten aus der Datenbank.
    * `start.sh` enthält zusätzliche Befehle, die nach dem Build vom Backend-Containers ausgeführt werden
    * `tsconfig.json` definiert relevante Parameter für den Build-Prozess der API (.ts -> .js)
* `/python` enthält externe Python Dateien. Enthält eine *extra* [README.md](./python/README.md). Läuft mit im Docker und hat ein eigenes Dockerfile.

### Datenschema für Anbindung universitärer Systeme
Zur Anbindung verschiedener universitärer System wird wie beschrieben ein npm-Paket genutzt, um die eingehenden XML-Dateien in das Baula-spezifische JSON zu transformieren. 
Hierzu werden Template-Dateien verwendet, welche im Ordern `/backend/api/src/templates` zu spezifizieren sind. Die Syntax kann an der beispielhaften `univis-template.ts` sowie durch die Doku des npm-Pakets [camaro](https://www.npmjs.com/package/camaro) erlernt werden und orientiert sich an [XPath](https://developer.mozilla.org/en-US/docs/Web/XML/XPath).
Folgende zusätzliche Dateien sind nötig:
* `student-fn2api.ts` regelt die Transformation von eingehenden Studierendendaten. Es müssen zwei Template definiert werden. Das `metaDataTemplate` beinhaltet die Transformation der studentischen Metadaten und orientiert sich am Interface `FnStudyprogramme`. Zusätzlich muss ein Template `studyPathTemplate` erstellt werden, welches die Transformation der Studienverlaufsinformationen regelt. Am Ende muss die Transformation das Format `{ completedModules: FnCompletedModule[], completedCourses: completedCourse[] }` haben und orientiert sich dabei an den Interfaces `FnCompletedModule` und `FnCompletedCourse`. Die Interfaces befinden sich unter `/interfaces/fn-user.ts`.
* `mhb-fn2mod.ts` regelt die Transformation der eingehenden Modulhandbücher in das Baula-Format. Hier müssen zu allen beteiligten Datenbanktabellen entsprechende Templates angelegt werden. Zum Überblick hier die Templatenamen mit den zugeordneten Datenformaten[^2]:

    | Template      | Schemareferenz | Beschreibung |
    | ----------- | ----------- | ----------- |
    | `depTemplate` | `Department` | Einrichtungen der Universität |
    | `personTempalte` | `Person` | Modulverantwortliche und Lehrpersonen |
    | `spTemplate` | `StudyProgramme` | Studiengänge |
    | `mhbTemplate` | `Mhb` | Modulhandbücher |
    | `mgTemplate` | `ModuleGroup` | Modulgruppen |
    | `modTemplate` | `Module` | Module |
    | `mcTemplate` | `ModuleCourse` | Modullehrveranstaltungen |
    | `modDepTemplate` | `ModuleDep` | Modulabhängigkeiten, bilden die Verknüpfungen zwischen Modulen dar |
    | `moduleExamTemplate` | `ModuleExam` | Modulprüfungen |
    | `per2mcTemplate` | `Person2ModCourse` | Verknüpfung zwischen Lehrpersonen und Modullehrveranstaltungen |
    | `sp2mhbTemplate` | `Sp2Mhb` | Verknüpfung zwischen Studiengängen und Modulhandbüchern |
    | `mhb2mgTemplate` | `Mhb2Mg` | Verkünpfung zwischen Modulgruppen und Modulhandbüchern |
    | `mg2mgTemplate` | `Mg2Mg` | Verknüpfung zwischen Modulgruppen |
    | `mg2modTemplate` | `Mod2Mg` | Verknüpfung zwischen Modulen und Modulgruppen |
    | `m2mcTemplate` | `Mod2ModCourse` | Verknüpfung zwischen Modulen und Modullehrveranstaltungen |


**Wichtig**: In Baula unterscheiden wir zwischen Modul, Modullehrveranstaltung und Lehrveranstaltung. Ein Modul stellt dabei nach KMK-Definition eine abgeschlossene Lerneinheit dar, welcher beliebig Modullehrveranstaltungen zugeordnet werden können. Diese sind bei uns abstrakt. Die konkrete Umsetzung einer Modullehrveranstaltung ist dann eine Lehrveranstaltung. Zur Erklärung ein Beispiel: Das Modul WebT besteht aus zwei Modullehrveranstaltungen - einer Vorlesung und einer Übung. Diesen können konkrete Lehrveranstaltungen eines Semesters zugeordent werden, der Übung zu WebT also beispielsweise die Übungsgruppe 1, die Übungsgruppe 2 und die Übungsgruppe 3 im Sommersemester 2025.

### Styleguide für Benennung von Routen
* konsistente Aufteilung in Subrouten für die einzelnen Bereiche
* konsistente Verwendung von _get_ um Daten abzufragen, _post_ um Daten zu erzeugen, _put_ um Daten zu aktualisieren und _delete_ um Daten zu entfernen. Dabei auch keine Wiederholung des Typs in der Route sondern lediglich über HTTP-Request-Typ steuern.
* kein CamelCase in Routen sondern zur besseren Lesbarkeit Bindestriche (-) verwenden.
* Konsistente Benennung von mehreren Items mit Plural und einzelnen Items mit Singular -> router.get('/all/mod*S*', getAllModules);


[^1]: **Wichtig:** Wenn das Schema geändert wird und eine Migration notwendig wird, muss ggf. das Volume gelöscht werden und entmounted werden. Ansonsten wirft der Migrationsprozess einen Fehler. Am besten also vorher ein Backup machen, um die Daten danach ggf. mit geänderter Struktur wieder einspielen zu könnnen.

[^2]: die Datenformate befinden sich alle in der `schema.prisma` unter `/backend/api/src/database`, **Wichtig** - es werden lediglich die Attributfelder der Modelle benötigt, die `@relation` Felder bzw. Felder mit eigenen Typen, wie z.B. `StudyProgramme[]` sind nur für Prisma zur Definition der Beziehungen relevant
