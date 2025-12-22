export interface Embedding { // all embeddings other than modules (jobs, topics, ...)
    _id: string,
    identifier: string, // jobId, topic tId, ...
    vector: number[];
    createdAt?: Date,
    updatedAt?: Date
}

export interface ModuleEmbedding {
    _id: string,
    acronym: string,
    vector: number[];
    createdAt?: Date,
    updatedAt?: Date
}