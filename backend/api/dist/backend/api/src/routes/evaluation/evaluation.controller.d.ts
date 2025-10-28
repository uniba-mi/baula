import { Request, Response, NextFunction } from "express";
export declare function initEvaluationData(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getOrganisationByCode(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateJobEvaluation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getEvaluationsBySpId(req: Request, res: Response, next: NextFunction): Promise<void>;
