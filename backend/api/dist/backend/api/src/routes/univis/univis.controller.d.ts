import { NextFunction, Request, Response } from "express";
export declare function getCourseDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSpecificCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTopNCoursesForCompetence(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCoursesOfSemester(req: Request, res: Response, next: NextFunction): Promise<void>;
