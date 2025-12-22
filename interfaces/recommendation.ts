import { Module } from "./module";

/** personal recommendation */
export interface Recommendation {
    userId?: string,
    recommendedMods?: RecommendedModule[],
    createdAt?: Date,
    updatedAt?: Date,
}

export interface Candidate {
    acronym: string,
    source: Source[],
    weight?: number,
}

export interface RecommendedModule extends Candidate {
    frequency?: number,
    score?: number,
}

export interface Source {
    type: string,
    identifier: string, // jobId, topic tId, ...
    score?: number,
}

// needed for extending rec modules with source
export type ModuleWithMetadata = Module & {
    metadata?: {
        frequency: number;
        source: Source[];
    };
};

export interface FeedbackRecommendationResult {
    recModules: Array<{
        acronym: string;
        score: number;
    }>;
}

export interface TopicRecommendationResult {
    recModules: Array<{
        acronym: string;
        score: number;
        frequency?: number;
        sources: Array<{
            identifier: string;
            score: number;
        }>;
    }>;
}
