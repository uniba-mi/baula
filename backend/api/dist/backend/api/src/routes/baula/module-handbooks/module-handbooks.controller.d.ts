import { NextFunction, Request, Response } from "express";
export declare function getMhbByIdAndVersion(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getModByAcronymAndVersion(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getModules(req: Request, res: Response, next: NextFunction): Promise<void>;
