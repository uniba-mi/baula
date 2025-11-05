import { logError } from "../shared/error";
import { postFetchData } from "./request";

const pathEmbeddingsForTopics = "/topic-embeddings";
const pathTopicModuleRecommendation = "/topic-module-recommendations";
const pathTopicModuleRecommendationPreGenerated = "/topic-module-recommendations-pre-generated";

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

