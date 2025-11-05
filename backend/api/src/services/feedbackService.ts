import { postFetchData } from "./request";

const pathFeedbackModuleRecommendation = "/feedback-module-recommendations";

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