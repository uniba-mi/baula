import { BadRequestError, logError, NotFoundError } from "../shared/error";

/** -----------------------------
 *  --- Initializing constants --
 *  -----------------------------*/
/* const envFile = `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: path.resolve(__dirname, "../../../", "environment", envFile) }); */
const localUrl = process.env.PYTHON_API_URL || "http://0.0.0.0";
//const localUrl = "http://python-app";
const port = 8000;

/** ---------------------------------------------
 *  ---- Create URL Function --------
 *  @param domain - The domain for the URL.
 *  @param port - The port number (can be null).
 *  @param path - The path for the URL (can be null).
 *  @returns The constructed URL as a string.
 *  ---------------------------------------------*/
export function createUrl(domain: string, port: number | null, path: string | null) {
    if (domain && port) {
        const baseUrl = `${domain}:${port.toString()}${path}`;
        const urlObject = new URL(baseUrl);
        return urlObject.toString();
    } else {
        throw new BadRequestError();
    }
}

/** ---------------------------------------------
 *  ---- POST Fetch Data Function --------
 *  @param path - The endpoint path for the fetch request.
 *  @param params - The parameters to be sent in the request body, as a JSON object.
 *  @returns The parsed JSON response data from the server.
 *  ---------------------------------------------*/
export async function postFetchData(path: string, params: Record<string, any>) {
    const url = createUrl(localUrl, port, path);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {

            if (response.status >= 400 && response.status < 500) {
                throw new BadRequestError(`Fehlerhafte Anfrage: ${response.status}`);
            } else if (response.status === 404) {
                throw new NotFoundError(`Resource nicht gefunden: ${path}`);
            }
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logError(error);
    }
}