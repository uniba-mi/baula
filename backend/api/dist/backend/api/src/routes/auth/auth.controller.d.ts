import { NextFunction, Request, Response } from "express";
export declare function localLogin(req: Request, res: Response, next: NextFunction): void;
export declare function loginRedirect(req: Request, res: Response): void | Response<any, Record<string, any>>;
/**---------------------------------------------
 * --------------- Logout Routes ---------------
 ** ---------------------------------------------*/
export declare function spInitiatedLogout(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function idpInitiatedLogout(req: Request, res: Response): void;
export declare function localLogout(req: Request, res: Response): void;
