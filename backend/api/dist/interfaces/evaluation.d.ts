export interface ModuleCandidate {
    acronym: string;
    name?: string;
    content?: string;
    skills?: string;
    chair?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface EvaluationJob {
    jobId: string;
    title?: string;
    desc?: string;
    profile?: string;
}
export interface RankedModule extends ModuleCandidate {
    ranking: number;
}
export interface Evaluation {
    spId: string;
    jobEvaluations: JobEvaluation[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface JobEvaluation {
    _id: string;
    job: EvaluationJob;
    candidates: ModuleCandidate[];
    rankedModules: RankedModule[];
    comment: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Organisation {
    id: string;
    name: string;
}
