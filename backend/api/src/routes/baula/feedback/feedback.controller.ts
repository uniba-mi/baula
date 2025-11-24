import { FeedbackRecommendationResult, RecommendedModule, Recommendation as IRecommendation } from '../../../../../../interfaces/recommendation';
import { NextFunction, Request, Response } from "express";
import { ModEmbedding, Recommendation } from "../../../database/mongo";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import { generateFeedbackBasedRecommendations } from "../../../services/feedback-service";
import { UserServer } from "../../../../../../interfaces/user";
import validator from "validator";
import { extractModules } from "../../../shared/helpers/module-helpers";

export async function updatePersonalRecommendationsByFeedback(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {
        const user = req.user as UserServer;
        const { moduleFeedback } = req.body;
        if (!user || !user._id) {
            return next(new BadRequestError("User not authenticated"));
        }

        // if contentmatch < 3, remove existing feedback sources and skip Python call
        if (moduleFeedback.contentmatch < 3) {

            let recommendations = await Recommendation.findOne({ userId: user._id });

            if (recommendations && recommendations.recommendedMods) {
                recommendations.recommendedMods.forEach((mod: any) => {
                    if (mod.source) {
                        mod.source = mod.source.filter((s: any) =>
                            !(s.type === 'feedback_similarmods' && s.identifier === moduleFeedback.acronym)
                        );
                        mod.frequency = mod.source.length;
                        if (mod.source.length > 0) {
                            const totalScore = mod.source.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
                            mod.score = totalScore / mod.source.length;
                        }
                    }
                });

                recommendations.recommendedMods = recommendations.recommendedMods.filter(
                    (mod: any) => mod.source && mod.source.length > 0
                );

                await recommendations.save();
                return res.status(200).json(recommendations);
            }

            return res.status(200).json({ message: "No existing recommendations to update" });
        }

        const mhbId = user.sps?.[0]?.mhbId;
        const mhbVersion = user.sps?.[0]?.mhbVersion;
        if (
            !mhbId ||
            !mhbVersion ||
            !validator.isAlphanumeric(mhbId, undefined, { ignore: "_-" }) ||
            !validator.isInt(mhbVersion.toString())
        ) {
            return next(new BadRequestError("No valid mhbId or mhbVersion found"));
        }

        const modules = await extractModules(mhbId, mhbVersion);
        if (!modules || modules.length === 0) {
            return next(new NotFoundError("No modules found for the given MHB information"));
        }

        // feedback embedding
        const feedbackModuleEmbedding = await ModEmbedding.findOne({
            acronym: moduleFeedback.acronym,
        });

        if (!feedbackModuleEmbedding || !feedbackModuleEmbedding.vector) {
            return res.status(200).json({
                message: "No embedding found for feedback module"
            });
        }

        // embeddings for all available modules in MHB
        const moduleAcronyms = modules.map((module) => module.acronym);
        const allModuleEmbeddings = await ModEmbedding.find({
            acronym: { $in: moduleAcronyms },
        });

        if (allModuleEmbeddings.length === 0) {
            return next(new NotFoundError("No embeddings found for available modules"));
        }

        const feedbackModuleData = {
            acronym: moduleFeedback.acronym,
            similarmodsRating: moduleFeedback.similarmods,
            vector: feedbackModuleEmbedding.vector,
        };

        const candidateModules = modules
            .map((module) => {
                const embedding = allModuleEmbeddings.find(
                    (emb) => emb.acronym === module.acronym
                );
                return {
                    acronym: module.acronym,
                    name: module.name,
                    vector: embedding?.vector || [],
                };
            })
            .filter((mod) => mod.vector.length > 0);

        if (candidateModules.length === 0) {
            return next(new Error("No valid embeddings found for recommendation"));
        }

        // Python API call
        const recommendations = await generateFeedbackBasedRecommendations(
            feedbackModuleData,
            candidateModules,
            0.65 // threshold
        );

        if (!recommendations || !recommendations.recModules) {
            return res.status(200).json({
                message: "No similar modules found above threshold",
                recommendations: { recommendedMods: [] }
            });
        }

        if (recommendations.recModules.length === 0) {
            return res.status(200).json({
                message: "No similar modules found above threshold",
                recommendations: { recommendedMods: [] }
            });
        }

        // Save recommendations
        const savedRecommendation = await saveFeedbackRecommendation(
            user,
            recommendations,
            moduleFeedback
        );

        res.status(200).json(savedRecommendation);
    } catch (error) {
        next(new BadRequestError("Failed to update recommendations based on feedback"));
    }
}

async function saveFeedbackRecommendation(
    user: UserServer,
    result: FeedbackRecommendationResult,
    feedback: any
): Promise<IRecommendation> {
    if (!user || !user._id) {
        throw new Error("Invalid user provided");
    }

    let recommendations = await Recommendation.findOne({
        userId: user._id,
    }).exec();

    if (!recommendations) {
        recommendations = new Recommendation({
            userId: user._id,
            recommendedMods: [],
            createdAt: new Date(),
        });
    }

    if (!recommendations.recommendedMods) {
        recommendations.recommendedMods = [];
    }

    for (const moduleRec of result.recModules) {
        const existingModuleIndex = recommendations.recommendedMods.findIndex(
            (m) => m.acronym === moduleRec.acronym
        );

        if (existingModuleIndex >= 0) {
            const existingModule = recommendations.recommendedMods[existingModuleIndex];

            if (!existingModule.source) {
                existingModule.source = [];
            }

            // search for existing feedback or create
            const existingSourceIndex = existingModule.source.findIndex(
                (existing) =>
                    existing.type === "feedback_similarmods" &&
                    existing.identifier === feedback.acronym
            );

            if (existingSourceIndex === -1) {
                existingModule.source.push({
                    type: "feedback_similarmods",
                    identifier: feedback.acronym,
                    score: moduleRec.score,
                });
            } else {
                existingModule.source[existingSourceIndex].score = moduleRec.score;
            }

            // TODO source length
            existingModule.frequency = existingModule.source.length;
            const totalScore = existingModule.source.reduce(
                (sum, source) => sum + (source.score || 0),
                0
            );
            existingModule.score = totalScore / existingModule.source.length;
        } else {

            // new recommendation entry for module
            const newModule: RecommendedModule = {
                acronym: moduleRec.acronym,
                source: [
                    {
                        type: "feedback_similarmods",
                        identifier: feedback.acronym,
                        score: moduleRec.score,
                    },
                ],
                frequency: 1,
                score: moduleRec.score,
            };

            recommendations.recommendedMods.push(newModule);
        }
    }

    await recommendations.save();
    return recommendations;
}

export async function deletePersonalRecommendationsByFeedback(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {
        const user = req.user as UserServer;
        const { acronym } = req.params;

        if (!user || !user._id) {
            return next(new BadRequestError("User not authenticated"));
        }

        if (!acronym || typeof acronym !== 'string') {
            return next(new BadRequestError("Invalid module acronym"));
        }

        let recommendations = await Recommendation.findOne({
            userId: user._id,
        }).exec();

        if (!recommendations || !recommendations.recommendedMods) {
            return res.status(200).json({ recommendedMods: [] });
        }

        // remove feedback sources where identifier matches the acronym
        for (const recModule of recommendations.recommendedMods) {
            if (!recModule.source) {
                recModule.source = [];
                continue;
            }

            // filter out sources that are feedback-related and match the acronym
            recModule.source = recModule.source.filter(
                source => !(
                    source.type?.includes('feedback') &&
                    source.identifier === acronym
                )
            );

            // update frequency and score
            if (recModule.source.length > 0) {
                recModule.frequency = recModule.source.length;
                const totalScore = recModule.source.reduce(
                    (sum, source) => sum + (typeof source.score === 'number' ? source.score : 0),
                    0
                );
                recModule.score = totalScore / recModule.source.length;
            }
        }

        // remove modules that no longer have any sources
        recommendations.recommendedMods = recommendations.recommendedMods.filter(
            recModule => Array.isArray(recModule.source) && recModule.source.length > 0
        );

        await recommendations.save();
        res.status(200).json(recommendations);
    } catch (error) {
        next(new BadRequestError("Failed to delete feedback recommendations"));
    }
}