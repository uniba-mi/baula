/**
 * Fetch similar module recommendations based on user feedback using pre-generated embeddings.
 * @param feedbackModule - The module with positive feedback including its embedding.
 * @param candidateModules - Array of all available modules with their embeddings.
 * @param threshold - Minimum similarity score (default 0.65).
 * @returns Promise resolving to recommendations from the Python API.
 */
export declare function generateFeedbackBasedRecommendations(feedbackModule: {
    acronym: string;
    similarmodsRating: number;
    vector: number[];
}, candidateModules: Array<{
    acronym: string;
    name: string;
    vector: number[];
}>, threshold?: number): Promise<{
    recModules: Array<{
        acronym: string;
        score: number;
    }>;
}>;
