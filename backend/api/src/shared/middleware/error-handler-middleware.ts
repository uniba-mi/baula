// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { logError } from "../error";

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new Error("Not Found"));
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || (err.name === "UnauthorizedError" ? 401 : 500);
  const message = err.message || "Internal Server Error";

  logError(err)

  res.status(status).json({
    error: {
      name: err.name,
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
}
