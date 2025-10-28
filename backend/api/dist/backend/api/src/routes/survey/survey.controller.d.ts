import { NextFunction, Request, Response } from "express";
export declare function saveResult(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function resetConsentResponse(req: Request, res: Response, next: NextFunction): Promise<void>;
