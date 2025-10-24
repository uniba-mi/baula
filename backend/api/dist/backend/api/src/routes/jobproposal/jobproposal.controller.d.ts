import express, { Request, Response, NextFunction } from "express";
export declare function crawlJob(req: Request, res: Response, next: NextFunction): Promise<express.Response<any, Record<string, any>> | undefined>;
export declare function generateJobKeywords(req: Request, res: Response, next: NextFunction): Promise<express.Response<any, Record<string, any>> | undefined>;
export declare function recommendModulesToJob(req: Request, res: Response, next: NextFunction): Promise<express.Response<any, Record<string, any>> | undefined>;
