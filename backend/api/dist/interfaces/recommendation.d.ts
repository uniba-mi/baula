import { Module } from "./module";
/** personal recommendation */
export interface Recommendation {
    userId?: string;
    recommendedMods?: RecommendedModule[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Candidate {
    acronym: string;
    source: Source[];
    weight?: number;
}
export interface RecommendedModule extends Candidate {
    frequency?: number;
    score?: number;
}
export interface Source {
    type: string;
    identifier: string;
    score?: number;
}
export type ModuleWithMetadata = Module & {
    metadata?: {
        frequency: number;
        source: Source[];
    };
};
