import express, { NextFunction, Request, Response, Router } from "express";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import { validateAndReturnSurveyResult } from "../../../shared/helpers/custom-validator";
import { LongTermEvaluation, User } from "../../../database/mongo";
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

export async function resetConsentResponse(
    req: Request,
    res: Response,
    next: NextFunction
) { 
    try {
        const users = await User.find(
            { "consents.ctype": "bakule-survey" }, 
        )
        if(users.length !== 0) {
            for(let user of users) {
                user.consents.forEach(consent => {
                    if(consent.ctype === 'bakule-survey') {
                        consent.hasResponded = false;
                    }
                })
                await user.save();
            }
            res.status(200).json('Consent wurde erfolgreich zurückgesetzt.')
        } else {
            next(new NotFoundError("Es konnten keine Consents gefunden werden."))
        }
        
    } catch(error) {
        console.log(error)
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

