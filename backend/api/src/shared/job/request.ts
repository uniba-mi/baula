import { scrapAfaSsWebsite } from "./jobScraping";
import { BadRequestError, NotFoundError, logError } from "../error";
import validator from "validator";
import { error } from "winston";
import { Module } from "../../module";
/* import * as dotenv from "dotenv";
import path from "path"; */

/** -----------------------------
 *  --- Initializing constants --
 *  -----------------------------*/
/* const envFile = `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: path.resolve(__dirname, "../../../", "environment", envFile) }); */
const localUrl = process.env.PYTHON_API_URL || "http://0.0.0.0";
//const localUrl = "http://python-app";
const port = 8000;
const pathjobModuleProposalKeyWords = "/recommend-modules-for-job";
const pathgetKeyWords = "/job-keywords";
const pathEmbeddingsForTopics = "/topic-embeddings";
const pathTopicModuleRecommendation = "/topic-module-recommendations";
const pathTopicModuleRecommendationPreGenerated = "/topic-module-recommendations-pre-generated";
const pathFeedbackModuleRecommendation = "/feedback-module-recommendations";

/** ---------------------------------------------
 *  ---- POST Fetch Data Function --------
 *  @param path - The endpoint path for the fetch request.
 *  @param params - The parameters to be sent in the request body, as a JSON object.
 *  @returns The parsed JSON response data from the server.
 *  ---------------------------------------------*/

async function postFetchData(path: string, params: Record<string, any>) {
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

      const errorText = await response.text();

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

/** ---------------------------------------------
 *  ---- Create URL Function --------
 *  @param domain - The domain for the URL.
 *  @param port - The port number (can be null).
 *  @param path - The path for the URL (can be null).
 *  @returns The constructed URL as a string.
 *  ---------------------------------------------*/
function createUrl(domain: string, port: number | null, path: string | null) {
  if (domain && port) {
    const baseUrl = `${domain}:${port.toString()}${path}`;
    const urlObject = new URL(baseUrl);
    return urlObject.toString();
  } else {
    throw new BadRequestError();
  }
}

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

/*=============================================================================
 *                             TOPICS
 *============================================================================/

 // TODO: move this part? Rename folder? Currently under job

/**
 * ---------------------------------------------
 * ---- Embedding Generation Request Function ----
 * @param topics - An array of topics, each containing a `name` and `description`.
 *
 * @returns A promise that resolves to the response of the embedding request.
 *
 * This function constructs a data object containing an array of topics (with `name` and `description`),
 * and sends a POST request to the topic embedding endpoint using the `postFetchData` function.
 * Any errors during the request are logged to the console.
 * ---------------------------------------------
 */
export async function generateEmbeddings(
  topics: { tId: string; name: string; description: string }[]
): Promise<any> {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error("Invalid topics array");
  }

  // Construct the data object for the request
  const data = {
    topics: topics.map((topic) => ({
      tId: topic.tId,
      name: topic.name,
      description: topic.description,
    })),
  };

  try {
    // Send the POST request and await the result
    const response = await postFetchData(pathEmbeddingsForTopics, data);
    return response;
  } catch (error) {
    logError(error);
    console.error("Generate Embeddings Error:", error);
    throw new Error("Failed to generate embeddings");
  }
}

/**
 * Fetch topic-module recommendations from Python API which creates embeddings.
 * @param topics - Array of topics with name and description.
 * @param modules - Array of modules with name and content.
 * @returns A promise resolving to recommendations from the Python API.
 */
export async function generateTopicModuleRecommendations(
  topics: { name: string; description: string }[],
  modules: { acronym: string; name: string; content: string }[]
): Promise<{ recModules: { acronym: string; score: number }[] } | undefined> {
  if (
    !Array.isArray(topics) ||
    topics.length === 0 ||
    !Array.isArray(modules) ||
    modules.length === 0
  ) {
    throw new Error("Invalid topics or modules data.");
  }

  const data = {
    topics,
    modules,
  };

  try {
    const result = await postFetchData(pathTopicModuleRecommendation, data);
    return result as { recModules: { acronym: string; score: number }[] };
  } catch (error) {
    console.error("Error fetching topic-module recommendations:", error);
    throw new Error("Failed to fetch topic-module recommendations.");
  }
}

/**
 * Fetch topic-module recommendations from Python API using pre-generated embeddings.
 * @param topics - Array of topics with their embeddings.
 * @param modules - Array of modules with their embeddings.
 * @returns A promise resolving to recommendations from the Python API.
 */
export async function generateTopicModuleRecommendationsPreGenerated(
  topics: Array<{
    tId: string;
    name: string;
    description: string;
    vector: number[];
  }>,
  modules: Array<{
    acronym: string;
    name: string;
    content: string;
    skills: string;
    vector: number[];
  }>
): Promise<{
  recModules: Array<{
    acronym: string;
    score: number;
    frequency: number;
    sources: Array<{
      identifier: string;
      score: number
    }>
  }>
}> {
  if (
    !Array.isArray(topics) ||
    topics.length === 0 ||
    !Array.isArray(modules) ||
    modules.length === 0
  ) {
    throw new Error("Invalid topics or modules data.");
  }

  const data = {
    topicEmbeddings: topics.map(topic => ({
      tId: topic.tId,
      vector: topic.vector
    })),
    moduleEmbeddings: modules.map(module => ({
      acronym: module.acronym,
      vector: module.vector
    }))
  };

  try {
    const result = await postFetchData(
      pathTopicModuleRecommendationPreGenerated,
      data
    );

    return result as {
      recModules: {
        acronym: string;
        score: number;
        frequency: number;
        sources: Array<{
          identifier: string;
          score: number
        }>
      }[]
    };
  } catch (error) {
    throw new Error("Failed to fetch topic-module recommendations with pre-generated embeddings.");
  }
}

/**
 * Fetch similar module recommendations based on user feedback using pre-generated embeddings.
 * @param feedbackModule - The module with positive feedback including its embedding.
 * @param candidateModules - Array of all available modules with their embeddings.
 * @param threshold - Minimum similarity score (default 0.65).
 * @returns Promise resolving to recommendations from the Python API.
 */
export async function generateFeedbackBasedRecommendations(
  feedbackModule: {
    acronym: string;
    similarmodsRating: number;
    vector: number[];
  },
  candidateModules: Array<{
    acronym: string;
    name: string;
    vector: number[];
  }>,
  threshold: number = 0.65
): Promise<{
  recModules: Array<{
    acronym: string;
    score: number;
  }>;
}> {
  if (!feedbackModule.vector || feedbackModule.vector.length === 0) {
    throw new Error("Invalid feedback module embedding.");
  }

  if (!Array.isArray(candidateModules) || candidateModules.length === 0) {
    throw new Error("Invalid candidate modules data.");
  }

  const data = {
    feedbackModule: {
      acronym: feedbackModule.acronym,
      vector: feedbackModule.vector,
      rating: feedbackModule.similarmodsRating,
    },
    candidateModules: candidateModules.map((module) => ({
      acronym: module.acronym,
      vector: module.vector,
    })),
    threshold: threshold,
  };

  try {
    const result = await postFetchData(pathFeedbackModuleRecommendation, data);

    return result as {
      recModules: Array<{
        acronym: string;
        score: number;
      }>;
    };
  } catch (error) {
    throw new Error("Failed to fetch feedback-based recommendations.");
  }
}