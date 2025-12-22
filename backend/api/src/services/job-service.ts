import { scrapAfaSsWebsite } from "../shared/helpers/job-scraping";
import { BadRequestError, logError } from "../shared/error";
import validator from "validator";
import { error } from "winston";
import { Module } from "../../../../interfaces/module";
import { postFetchData } from "./request";

/** -----------------------------
 *  --- Initializing constants --
 *  -----------------------------*/
const pathjobModuleProposalKeyWords = "/recommend-modules-for-job";
const pathgetKeyWords = "/job-keywords";

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
export async function getJobInformationAndKeywords(
  jobUrl: string,
  resultLimit: number
) {
  try {
    // Decode the job URL if it is URL-encoded
    if (jobUrl.includes("%3A%2F%2F")) {
      if (validator.isURL(jobUrl)) {
        jobUrl = decodeURIComponent(jobUrl);
      } else {
        throw new Error("Invalid URL");
      }
    }

    // Scrape the title and description from the job URL
    const [title, desc] = await scrapAfaSsWebsite(jobUrl);

    // Check if a description was found
    if (desc === undefined) {
      console.error("Something went wrong:", jobUrl);
      throw new BadRequestError("No description found");
    }

    // Set default result limit if not provided
    if (!resultLimit) {
      resultLimit = 5;
    }

    // Perform the keyword request
    const jobInformation = await keywordRequest(title, desc, resultLimit);

    return jobInformation;
  } catch (error) {
    // Log any errors that occur during the process
    logError(error);
    console.error("Error occurred while creating keyword request:", error);
  }
}

export async function getJobInformation(
  jobUrl: string
) {
  try {
    // Decode the job URL if it is URL-encoded
    if (jobUrl.includes("%3A%2F%2F")) {
      if (validator.isURL(jobUrl)) {
        jobUrl = decodeURIComponent(jobUrl);
      } else {
        throw new Error("Invalid URL");
      }
    }

    // Scrape the title and description from the job URL
    const [title, desc] = await scrapAfaSsWebsite(jobUrl);

    // Check if a description was found
    if (desc === undefined) {
      console.error("Something went wrong:", jobUrl);
      throw new BadRequestError("No description found");
    }

    return { title, description: desc, inputMode: 'url', keywords: [] };
  } catch (error) {
    // Log any errors that occur during the process
    logError(error);
    console.error("Error occurred while creating keyword request:", error);
  }
}

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
export async function jobModuleProposalKeyWordsRequest(
  title: string,
  keywords: string[],
  modules: Module[]
): Promise<
  | {
    title: string;
    keywords: string[];
    recModules: { acronym: string; score: number }[];
  }
  | undefined
> {
  const data = {
    title: title,
    keywords: keywords.join(", "),
    modules: modules,
  };

  try {
    const result = (await postFetchData(
      pathjobModuleProposalKeyWords,
      data
    )) as {
      title: string;
      keywords: string[];
      recModules: { acronym: string; score: number }[];
    };
    return result;
  } catch (error) {
    logError(error);
  }
}

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
export async function keywordRequest(
  title: string,
  description: string,
  keywordNumber: number
): Promise<any> {
  // Validate required parameters
  if (title && description && keywordNumber) {
    if (validator.isNumeric(keywordNumber.toString())) {
      // Construct the data object for the request
      const data = {
        title: title,
        description: description,
        keywordNumber: keywordNumber,
      };

      try {
        // Send the POST request and await the result
        const response = await postFetchData(pathgetKeyWords, data);
        return response;
      } catch (error) {
        logError(error);
        throw new Error("Something went wrong");
      }
    }
  } else {
    logError(error);
    throw new Error("Something is wrong");
  }
}
