export interface Logmessage {
    level: string,
    message: string,
    timestamp: string
}

export interface Changelog {
    queried: number,
    added: number,
    updated: number,
    deleted: number,
    error: boolean,
    detailLog: string[]
}

export type MergedChangelog = Record<string, Changelog>;

export interface ImportLogMessage {
    logs: string[],
    detailLog: string[]
}