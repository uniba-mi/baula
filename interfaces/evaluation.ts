export interface ModuleCandidate {
    acronym: string; // e. g. module acronym
    name?: string,
    content?: string;
    skills?: string;
    chair?: string;
    createdAt?: Date,
    updatedAt?: Date
}

export interface EvaluationJob {
    jobId: string,
    title?: string,
    desc?: string,
    profile?: string,
}

export interface RankedModule extends ModuleCandidate {
    ranking: number;
}

export interface Evaluation { // evaluation for each sp
    spId: string; // BAAng etc.
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

export interface Organisation { // can be chair, programme, ...
    id: string;
    name: string;
}