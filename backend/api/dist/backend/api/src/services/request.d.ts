/** ---------------------------------------------
 *  ---- Create URL Function --------
 *  @param domain - The domain for the URL.
 *  @param port - The port number (can be null).
 *  @param path - The path for the URL (can be null).
 *  @returns The constructed URL as a string.
 *  ---------------------------------------------*/
export declare function createUrl(domain: string, port: number | null, path: string | null): string;
/** ---------------------------------------------
 *  ---- POST Fetch Data Function --------
 *  @param path - The endpoint path for the fetch request.
 *  @param params - The parameters to be sent in the request body, as a JSON object.
 *  @returns The parsed JSON response data from the server.
 *  ---------------------------------------------*/
export declare function postFetchData(path: string, params: Record<string, any>): Promise<unknown>;
