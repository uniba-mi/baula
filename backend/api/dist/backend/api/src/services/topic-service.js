"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTopicModuleRecommendations = generateTopicModuleRecommendations;
exports.generateTopicModuleRecommendationsPreGenerated = generateTopicModuleRecommendationsPreGenerated;
exports.generateEmbeddings = generateEmbeddings;
const error_1 = require("../shared/error");
const request_1 = require("./request");
const pathEmbeddingsForTopics = "/topic-embeddings";
const pathTopicModuleRecommendation = "/topic-module-recommendations";
const pathTopicModuleRecommendationPreGenerated = "/topic-module-recommendations-pre-generated";
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
        const result = await (0, request_1.postFetchData)(pathTopicModuleRecommendation, data);
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
        const result = await (0, request_1.postFetchData)(pathTopicModuleRecommendationPreGenerated, data);
        return result;
    }
    catch (error) {
        throw new Error("Failed to fetch topic-module recommendations with pre-generated embeddings.");
    }
}
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
        const response = await (0, request_1.postFetchData)(pathEmbeddingsForTopics, data);
        return response;
    }
    catch (error) {
        (0, error_1.logError)(error);
        console.error("Generate Embeddings Error:", error);
        throw new Error("Failed to generate embeddings");
    }
}
