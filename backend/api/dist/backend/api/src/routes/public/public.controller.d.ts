import { NextFunction, Request, Response } from "express";
export declare function getUniqueModules(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getBilAppCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCompetenceAndModulesOfCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
