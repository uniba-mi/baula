import { NextFunction, Request, Response } from "express";
export declare function getTopicTree(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTopicChildren(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function recommendModulesByTopicsPreGenerated(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
