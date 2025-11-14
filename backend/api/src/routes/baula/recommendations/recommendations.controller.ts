import { NextFunction, Request, Response } from "express";
import { Recommendation } from "../../../database/mongo";
import { BadRequestError } from "../../../shared/error";
import { UserServer } from "../../../../../../interfaces/user";

export async function getPersonalRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as UserServer;
    const recommendations = await Recommendation.find({ userId: user._id });
    res.status(200).json(recommendations);
  } catch (error) {
    next(new BadRequestError('Fehler beim Abruf der Empfehlung'));
  }
}