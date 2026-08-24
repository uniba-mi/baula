// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { logError, NotFoundError } from "../error";
import { isSecureEnvironment } from "../../config/env.config";

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError());
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || (err.name === "UnauthorizedError" ? 401 : 500);
  const message = err.message || "Internal Server Error";

  logError(err)

  res.status(status).json({
    error: {
      name: err.name,
      message,
      // Only leak stack traces where the API is not publicly reachable
      ...(!isSecureEnvironment && { stack: err.stack }),
    },
  });
}
