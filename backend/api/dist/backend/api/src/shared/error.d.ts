export declare class BadRequestError extends Error {
    constructor(message?: string, name?: string);
}
export declare class NotFoundError extends Error {
    constructor(message?: string, name?: string);
}
export declare function logError(value: unknown): void;
