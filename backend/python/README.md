# Python-API
Hier ist die Python-Schnittstelle des Baula-Backends dokumentiert. Die Python-API wurde im Grundaufbau im Wintersemester 2024/25 von Oliver Schmidt in seinem AI-Projekt konzipiert und anschließend an die angepassten Bedarfe optimiert. Die API wird mit fastAPI umgesetzt und dient der effizienten Verarbeitung (insbesondere NLP-Prozesse) von übergebenen Daten. Die API ist komplett intern und wird lediglich von der offiziellen Node-API von Baula aufgerufen, um damit Prozesse anzusteuern, welche mit Typescript umständlich und mit Hilfe von Python deutlich effizienter implementiert werden können.

## Aufbau des Projekts
- `/api` Hier werden die konkreten Schnittstellen der FastAPI definiert und die relevanten Funktionen der Route aus dem passenden Modul (unter `/modules`) aufgerufen.
- `/models` enthält Code bezüglich des Umgangs mit (Transformer-)Modellen
- `/modules` enthält für jedes Modul (z.B. Job - jobModuleMain) die relevanten Funktionen für die API bzw. die Verarbeitung der übergebenen Daten. Namenschema sollte `{modul}ModuleMain.py`.
- `/utils` enthält Hilfsfunktionen, die an mehreren Stellen wiederverwendet werden.
- `Dockerfile` Hier wird definiert, was beim Bauen des Docker-Containers ausgeführt bzw. installiert werden muss -> Installationsskript für den Python-Docker-Container.
- `main.py` enthält den Code zum Starten des Python-Server -> aktuell auf Port 8000
- `requirements.txt` enthält alle genutzten Python-Pakete inklusive Version


## Erstinbetriebnahme
Folgende Variabeln könnten bearbeitet werden:
main.py:
- apiPort (8000)
- apiIpAdresse (0.0.0.0)

requestTsApi:
- url [Adresse der TypeScript API] (http://host.docker.internal:3305)


