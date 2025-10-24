import { Request, Response } from 'express';
export declare function getAllStandards(req: Request, res: Response): Promise<void>;
export declare function getSingleStandard(req: Request, res: Response): Promise<void>;
export declare function getAllCompetences(req: Request, res: Response): Promise<void>;
export declare function getCompetencesFromStandard(req: Request, res: Response): Promise<void>;
export declare function getUppestCompetenceGroups(req: Request, res: Response): Promise<void>;
export declare function getAllUppestCompetenceGroups(req: Request, res: Response): Promise<void>;
export declare function getAllLowerCompetences(req: Request, res: Response): Promise<void>;
export declare function getLowerCompetences(req: Request, res: Response): Promise<void>;
