import express, { NextFunction, Request, Response } from "express";
export declare function getCohortRecsAvailableInfo(req: Request, res: Response): Promise<void>;
export declare function getAvgRecSemester(req: Request, res: Response): Promise<void>;
export declare function getSucRecSemester(req: Request, res: Response): Promise<void>;
export declare function getSuccessors(req: Request, res: Response): Promise<void>;
export declare function getTopNSuccessors(req: Request, res: Response): Promise<void>;
export declare function getCommonlyPassedModules(req: Request, res: Response): Promise<void>;
export declare function getTopNCommonPasses(req: Request, res: Response): Promise<void>;
export declare function getBottomNCommonPasses(req: Request, res: Response): Promise<void>;
export declare function getPrecursors(req: Request, res: Response): Promise<void>;
/**
 * Generic helper function. Reads a JSON file and parses it into a JS object.
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {Promise<T>} - Promise with parsed JSON data as type T.
 * @template T - The type of the expected data structure that the JSON file contains.
 */
export declare function readJsonFile<T>(filePath: string): Promise<T>;
export declare function getTopicTree(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTopicChildren(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function recommendModulesByTopicsPreGenerated(req: Request, res: Response, next: NextFunction): Promise<void | express.Response<any, Record<string, any>>>;
export declare function getPersonalRecommendations(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updatePersonalRecommendationsByFeedback(req: Request, res: Response, next: NextFunction): Promise<void | express.Response<any, Record<string, any>>>;
export declare function deletePersonalRecommendationsByFeedback(req: Request, res: Response, next: NextFunction): Promise<void | express.Response<any, Record<string, any>>>;
