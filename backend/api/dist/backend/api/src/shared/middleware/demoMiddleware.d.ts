import { NextFunction, Request, Response } from "express";
export declare function denyDemoWrites(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
