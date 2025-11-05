/**
 * Fetch topic-module recommendations from Python API which creates embeddings.
 * @param topics - Array of topics with name and description.
 * @param modules - Array of modules with name and content.
 * @returns A promise resolving to recommendations from the Python API.
 */
export declare function generateTopicModuleRecommendations(topics: {
    name: string;
    description: string;
}[], modules: {
    acronym: string;
    name: string;
    content: string;
}[]): Promise<{
    recModules: {
        acronym: string;
        score: number;
    }[];
} | undefined>;
/**
 * Fetch topic-module recommendations from Python API using pre-generated embeddings.
 * @param topics - Array of topics with their embeddings.
 * @param modules - Array of modules with their embeddings.
 * @returns A promise resolving to recommendations from the Python API.
 */
export declare function generateTopicModuleRecommendationsPreGenerated(topics: Array<{
    tId: string;
    name: string;
    description: string;
    vector: number[];
}>, modules: Array<{
    acronym: string;
    name: string;
    content: string;
    skills: string;
    vector: number[];
}>): Promise<{
    recModules: Array<{
        acronym: string;
        score: number;
        frequency: number;
        sources: Array<{
            identifier: string;
            score: number;
        }>;
    }>;
}>;
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
export declare function generateEmbeddings(topics: {
    tId: string;
    name: string;
    description: string;
}[]): Promise<any>;
