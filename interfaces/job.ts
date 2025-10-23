import { RecommendedModule } from "./recommendation"


// extended Job is used in user profile
export interface ExtendedJob extends Job {
    recModules: RecommendedModule[],
    loading?: boolean
}

// represents the mongo db job collection
export interface Job extends Jobtemplate {
    _id: string,
    embeddingId: string,
    userId?: string,
    createdAt?: Date,
    updatedAt?: Date
}

// is used for the job proposal
export interface Jobtemplate {
    title: string,
    description?: string,
    inputMode: string,
    keywords: string[],
}