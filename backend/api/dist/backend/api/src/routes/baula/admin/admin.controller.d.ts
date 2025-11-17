import { NextFunction, Request, Response } from "express";
export declare function getCronjobLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getErrorLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAllAcademicDates(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addAcademicDate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateAcademicDate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteAcademicDate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addDateType(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateDateType(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteDateType(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getConnectedCoursesForModule(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function initConnectionModulecourse2Course(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createCourseToModuleConnection(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteCourseToModuleConnection(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function crawlCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function crawlFN2Modules(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addModuleStructureToDatabase(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Update module embeddings with embedding vectors in JSON file
 */
export declare function updateModuleEmbeddings(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Initialize topics and embeddings from the JSON file containing topic vectors
 */
export declare function initTopicsFromJSON(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getReporting(req: Request, res: Response, next: NextFunction): Promise<void>;
