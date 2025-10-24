import { RecommendedModule } from "./recommendation";
export interface ExtendedJob extends Job {
    recModules: RecommendedModule[];
    loading?: boolean;
}
export interface Job extends Jobtemplate {
    _id: string;
    embeddingId: string;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Jobtemplate {
    title: string;
    description?: string;
    inputMode: string;
    keywords: string[];
}
