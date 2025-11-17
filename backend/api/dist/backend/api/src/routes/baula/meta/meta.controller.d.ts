import { NextFunction, Request, Response } from 'express';
export declare function getDistinctDepartments(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getDistinctCourseTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAcademicDatesBySemester(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getDateTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
