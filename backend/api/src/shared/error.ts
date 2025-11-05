import { logger } from "./utils/logger";

export class BadRequestError extends Error {
  statusCode = 400;
  constructor(message="The request was invalid or malformed.") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message="The requested resource could not be found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function logError(value: unknown) {
  if (value instanceof Error) {
    logger.error(value.message)
  } else {
    let stringified = "[Unable to stringify the thrown value]";
    try {
      stringified = JSON.stringify(value);
    } catch (error) { }

    const error = new Error(
      `This value was thrown as is, not through an error: ${stringified}`
    );
    logger.error(error.message);
  }
}
