"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobInformationAndKeywords = getJobInformationAndKeywords;
exports.getJobInformation = getJobInformation;
exports.jobModuleProposalKeyWordsRequest = jobModuleProposalKeyWordsRequest;
exports.keywordRequest = keywordRequest;
exports.generateEmbeddings = generateEmbeddings;
exports.generateTopicModuleRecommendations = generateTopicModuleRecommendations;
exports.generateTopicModuleRecommendationsPreGenerated = generateTopicModuleRecommendationsPreGenerated;
const jobScraping_1 = require("./jobScraping");
const error_1 = require("../error");
const validator_1 = __importDefault(require("validator"));
const winston_1 = require("winston");
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
/** ---------------------------------------------
 *  ---- POST Fetch Data Function --------
 *  @param path - The endpoint path for the fetch request.
 *  @param params - The parameters to be sent in the request body, as a JSON object.
 *  @returns The parsed JSON response data from the server.
 *  ---------------------------------------------*/
async function postFetchData(path, params) {
    const url = createUrl(localUrl, port, path);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        console.log("Python API response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.log("Python API error:", errorText);
            if (response.status >= 400 && response.status < 500) {
                throw new error_1.BadRequestError(`Fehlerhafte Anfrage: ${response.status}`);
            }
            else if (response.status === 404) {
                throw new error_1.NotFoundError(`Resource nicht gefunden: ${path}`);
            }
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        (0, error_1.logError)(error);
    }
}
/** ---------------------------------------------
 *  ---- Create URL Function --------
 *  @param domain - The domain for the URL.
 *  @param port - The port number (can be null).
 *  @param path - The path for the URL (can be null).
 *  @returns The constructed URL as a string.
 *  ---------------------------------------------*/
function createUrl(domain, port, path) {
    if (domain && port) {
        const baseUrl = `${domain}:${port.toString()}${path}`;
        const urlObject = new URL(baseUrl);
        return urlObject.toString();
    }
    else {
        throw new error_1.BadRequestError();
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
async function getJobInformationAndKeywords(jobUrl, resultLimit) {
    try {
        // Decode the job URL if it is URL-encoded
        if (jobUrl.includes("%3A%2F%2F")) {
            if (validator_1.default.isURL(jobUrl)) {
                jobUrl = decodeURIComponent(jobUrl);
            }
            else {
                throw new Error("Invalid URL");
            }
        }
        // Scrape the title and description from the job URL
        const [title, desc] = await (0, jobScraping_1.scrapAfaSsWebsite)(jobUrl);
        // Check if a description was found
        if (desc === undefined) {
            console.error("Something went wrong:", jobUrl);
            throw new error_1.BadRequestError("No description found");
        }
        // Set default result limit if not provided
        if (!resultLimit) {
            resultLimit = 5;
        }
        // Perform the keyword request
        const jobInformation = await keywordRequest(title, desc, resultLimit);
        return jobInformation;
    }
    catch (error) {
        // Log any errors that occur during the process
        (0, error_1.logError)(error);
        console.error("Error occurred while creating keyword request:", error);
    }
}
async function getJobInformation(jobUrl) {
    try {
        // Decode the job URL if it is URL-encoded
        if (jobUrl.includes("%3A%2F%2F")) {
            if (validator_1.default.isURL(jobUrl)) {
                jobUrl = decodeURIComponent(jobUrl);
            }
            else {
                throw new Error("Invalid URL");
            }
        }
        // Scrape the title and description from the job URL
        const [title, desc] = await (0, jobScraping_1.scrapAfaSsWebsite)(jobUrl);
        // Check if a description was found
        if (desc === undefined) {
            console.error("Something went wrong:", jobUrl);
            throw new error_1.BadRequestError("No description found");
        }
        return { title, description: desc, inputMode: 'url', keywords: [] };
    }
    catch (error) {
        // Log any errors that occur during the process
        (0, error_1.logError)(error);
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
async function jobModuleProposalKeyWordsRequest(title, keywords, modules) {
    const data = {
        title: title,
        keywords: keywords.join(", "),
        modules: modules,
    };
    try {
        const result = (await postFetchData(pathjobModuleProposalKeyWords, data));
        return result;
    }
    catch (error) {
        (0, error_1.logError)(error);
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
async function keywordRequest(title, description, keywordNumber) {
    // Validate required parameters
    if (title && description && keywordNumber) {
        if (validator_1.default.isNumeric(keywordNumber.toString())) {
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
            }
            catch (error) {
                (0, error_1.logError)(error);
                throw new Error("Something went wrong");
            }
        }
    }
    else {
        (0, error_1.logError)(winston_1.error);
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
async function generateEmbeddings(topics) {
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
    }
    catch (error) {
        (0, error_1.logError)(error);
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
async function generateTopicModuleRecommendations(topics, modules) {
    if (!Array.isArray(topics) ||
        topics.length === 0 ||
        !Array.isArray(modules) ||
        modules.length === 0) {
        throw new Error("Invalid topics or modules data.");
    }
    const data = {
        topics,
        modules,
    };
    try {
        const result = await postFetchData(pathTopicModuleRecommendation, data);
        return result;
    }
    catch (error) {
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
async function generateTopicModuleRecommendationsPreGenerated(topics, modules) {
    if (!Array.isArray(topics) ||
        topics.length === 0 ||
        !Array.isArray(modules) ||
        modules.length === 0) {
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
        const result = await postFetchData(pathTopicModuleRecommendationPreGenerated, data);
        return result;
    }
    catch (error) {
        throw new Error("Failed to fetch topic-module recommendations with pre-generated embeddings.");
    }
}
