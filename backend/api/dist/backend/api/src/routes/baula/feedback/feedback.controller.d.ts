import { NextFunction, Request, Response } from "express";
export declare function updatePersonalRecommendationsByFeedback(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
export declare function deletePersonalRecommendationsByFeedback(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
