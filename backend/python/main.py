import uvicorn

apiPort = 8000
apiIpAddress = "0.0.0.0"

if __name__ == "__main__":
    """
    Startet den Uvicorn-Server für die FastAPI-Anwendung.

    Der Uvicorn-Server wird mit den folgenden Optionen gestartet:
    - 'host': auf 0.0.0.0 gesetzt, um Verbindungen von allen IP-Adressen zuzulassen.
    - 'port': auf 8000 gesetzt, um den Server auf Port 8000 zu starten.
    - 'reload': auf True gesetzt, um den Server automatisch neu zu laden, wenn Änderungen am Code vorgenommen werden.
    - 'timeout_keep_alive': auf 11 Sekunden gesetzt, um die Zeit zu steuern, wie lange der Server auf eingehende Verbindungen wartet.

    :return: None
    """
    uvicorn.run("api.api:app", host=apiIpAddress, port=apiPort, reload=True, timeout_keep_alive=11)