import { NextFunction, Request, Response } from "express";
import { Request as JWTRequest } from "express-jwt";
export declare function getUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateModuleInStudyPath(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateStudyPath(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function finishSemester(req: Request, res: Response, next: NextFunction): Promise<void>;
/** Update of competence aims in database
 * @param req contains aims in form of CompAim[] and uId to validate user
 * @param res
 * @param next */
export declare function updateCompetenceAims(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteModuleFromStudyPath(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteStudyPath(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteFavouriteModules(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteExcludedModules(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteExcludedModule(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateDashboardView(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateTimetableSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateFavouriteModule(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateExcludedModule(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function toggleTopic(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateHint(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addConsents(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateModuleFeedback(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
export declare function deleteModuleFeedback(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
export declare function deleteJob(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteUser(req: JWTRequest, res: Response, next: NextFunction): Promise<void>;
export declare function crawlStudentDataViaFlexNow(req: Request, res: Response, next: NextFunction): Promise<void>;
