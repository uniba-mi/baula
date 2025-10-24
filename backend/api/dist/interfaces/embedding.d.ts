export interface Embedding {
    _id: string;
    identifier: string;
    vector: number[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ModuleEmbedding {
    _id: string;
    acronym: string;
    vector: number[];
    createdAt?: Date;
    updatedAt?: Date;
}
