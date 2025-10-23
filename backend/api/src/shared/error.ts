import { logger } from "./logger";

export class BadRequestError extends Error {
  constructor(message?: string, name?: string) {
    super(message ? message : "Es ist ein Fehler aufgetreten.");
    this.name = name ? name : "BadRequestError";
  }
}

export class NotFoundError extends Error {
  constructor(message?: string, name?: string) {
    super(
      message
        ? message
        : "Die angefragte Resource konnte nicht gefunden werden."
    );
    this.name = name ? name : "NotFoundError";
  }
}

export function logError(value: unknown) {
  if (value instanceof Error) {
    logger.error(value.message)
  } else {
    let stringified = "[Unable to stringify the thrown value]";
    try {
      stringified = JSON.stringify(value);
    } catch (error) {}

    const error = new Error(
      `This value was thrown as is, not through an Error: ${stringified}`
    );
    logger.error(error.message);
  }
}
