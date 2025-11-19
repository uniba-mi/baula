import { Module } from "../../../../interfaces/module";
/** ---------------------------------------------
 *  ---- Create Keyword Request Function --------
 *  @param jobUrl - The URL of the job to be scraped for keywords.
 *  @param resultLimit - The maximum number of results to return (default is 5).
 *  @returns The results of the keyword request from the scraping process.
 *
 *  This function decodes the job URL if it is URL-encoded, scrapes the
 *  relevant title and description using the provided job URL, and
 *  performs a keyword request based on the scraped data. If no description
 *  is found, a message is logged, and the function returns early.
 *  If resultLimit is not provided, it defaults to 5.
 *  ---------------------------------------------*/
export declare function getJobInformationAndKeywords(jobUrl: string, resultLimit: number): Promise<any>;
export declare function getJobInformation(jobUrl: string): Promise<{
    title: any;
    description: any;
    inputMode: string;
    keywords: never[];
} | undefined>;
/** ---------------------------------------------
 *  ---- Job Module Proposal Keywords Request Function --------
 *  @param title - The title of the job proposal.
 *  @param keywords - A string containing keywords associated with the job proposal.
 *  @param modules - An array of modules associated with the job proposal.
 *
 *  @returns A promise that resolves to the result of the POST request
 *           to create keyword proposals for the job.
 *
 *  This function constructs a data object containing the title, keywords,
 *  MHB ID, and version, and sends a POST request to the job module proposal
 *  keywords endpoint using the postFetchData function. Any errors during
 *  the request are logged to the console.
 *  ---------------------------------------------*/
export declare function jobModuleProposalKeyWordsRequest(title: string, keywords: string[], modules: Module[]): Promise<{
    title: string;
    keywords: string[];
    recModules: {
        acronym: string;
        score: number;
    }[];
} | undefined>;
/** ---------------------------------------------
 *  ---- Keyword Request Function --------
 *  @param title - The title for which keywords are to be generated.
 *  @param description - The description providing context for the keywords.
 *  @param keywordNumber - The number of keywords to generate.
 *
 *  @returns A promise that resolves to the response of the keyword request.
 *
 *  This function constructs a data object containing the title, description,
 *  and the desired number of keywords, and sends a POST request to the
 *  keyword generation endpoint using the postFetchData function.
 *  Any errors during the request are logged to the console.
 *  ---------------------------------------------*/
export declare function keywordRequest(title: string, description: string, keywordNumber: number): Promise<any>;
