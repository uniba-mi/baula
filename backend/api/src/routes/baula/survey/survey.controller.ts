import express, { NextFunction, Request, Response, Router } from "express";
import { BadRequestError } from "../../../shared/error";
import { validateAndReturnSurveyResult } from "../../../shared/helpers/custom-validator";
import { LongTermEvaluation } from "../../../database/mongo";
import validator from "validator";

const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

export async function saveResult(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const result = validateAndReturnSurveyResult(req.body.result);

    if(result) {
        result.feedback = result.feedback ? validator.blacklist(result.feedback, '[$<>;{}\[\]()\'"`=]') : '';
        try {
            const savedResult = await LongTermEvaluation.create({
                ...result
            })
            res.status(200).send(savedResult)
        } catch(error) {
            console.log(error)
            next(new BadRequestError())
        }

    } else {
        next(new BadRequestError())
    }
}

export async function getResults(
    req: Request,
    res: Response,
    next: NextFunction) {
    try {
        const results = await LongTermEvaluation.find();
        res.json(results)
    } catch(error) {
        console.log(error)
        next(new BadRequestError())
    }
}

