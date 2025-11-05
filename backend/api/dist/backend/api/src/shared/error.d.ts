export declare class BadRequestError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class NotFoundError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare function logError(value: unknown): void;
