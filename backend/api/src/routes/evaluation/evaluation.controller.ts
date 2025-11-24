import { BadRequestError, NotFoundError } from "../../shared/error";
import { Request, Response, NextFunction } from "express";
// import { orga2code } from '../../../staticdata/evaluationData/organisations'
import { Evaluation } from "../../database/mongo";
import { Evaluation as IEvaluation, Organisation } from "../../../../../interfaces/evaluation";
import { UserServer } from "../../../../../interfaces/user";

// export async function initEvaluationData(req: Request, res: Response, next: NextFunction) {
//     try {
//         const studyProgrammes = ['BAAng', 'BAInf', 'BAWIn', 'BKIDS', 'MAAng', 'MaCiH', 'MIISM', 'MAWin'];

//         for (const spId of studyProgrammes) {
//             const { candidates: candidatesData } = await import(`../../../staticdata/evaluationData/${spId}/candidates`);

//             const jobEvaluations = candidatesData.map((item: { jobId: string; candidates: string; }) => ({
//                 job: {
//                     jobId: item.jobId,
//                 },
//                 candidates: item.candidates.split(', ').map((acronym): { acronym: string; } => ({
//                     acronym: acronym.trim()
//                 })),
//                 rankedModules: [],
//                 comment: '',
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//             }));

//             await Evaluation.findOneAndUpdate(
//                 { spId },
//                 { spId, jobEvaluations },
//                 { upsert: true, new: true, setDefaultsOnInsert: true }
//             );
//         }

//         res.status(200).json({ message: 'Initialisierung beendet' });
//     } catch (error) {
//         console.error(error);
//         next(new BadRequestError());
//     }
// }

// export async function getOrganisationByCode(req: Request, res: Response, next: NextFunction) {
//     const user = req.user as UserServer;
//     console.log(user.shibId)


//     const orga: Organisation | undefined = orga2code[user.shibId];

//     res.status(200).json(orga);
// }

// export async function updateJobEvaluation(req: Request, res: Response, next: NextFunction) {
//     try {
//         const { spId, jobId } = req.params;
//         const { rankedModules, comment } = req.body;

//         const evaluation = await Evaluation.findOne({ spId });
//         if (!evaluation) {
//             return next(new NotFoundError('Evaluation not found'));
//         }

//         const jobEvaluationIndex = evaluation.jobEvaluations.findIndex(
//             je => je.job.jobId === jobId
//         );

//         if (jobEvaluationIndex === -1) {
//             return next(new NotFoundError('Job evaluation not found'));
//         }

//         evaluation.jobEvaluations[jobEvaluationIndex].rankedModules = rankedModules;
//         evaluation.jobEvaluations[jobEvaluationIndex].comment = comment;
//         evaluation.jobEvaluations[jobEvaluationIndex].updatedAt = new Date();

//         await evaluation.save();

//         res.status(200).json({
//             message: 'Job evaluation updated successfully',
//             jobEvaluation: evaluation.jobEvaluations[jobEvaluationIndex]
//         });

//     } catch (error) {
//         console.error('Error updating job evaluation:', error);
//         next(new BadRequestError('Failed to update job evaluation'));
//     }
// }

// export async function getEvaluationsBySpId(req: Request, res: Response, next: NextFunction) {
//     try {
//         const { spId } = req.params;

//         const evaluation = await Evaluation.findOne({ spId }).lean();

//         if (!evaluation) {
//             return next(new NotFoundError());
//         }

//         const { jobs } = await import(`../../../staticdata/evaluationData/jobs`);
//         const modules = require(`../../../staticdata/evaluationData/${spId}/modules_${spId}_20252.json`);

//         const evaluationWithDetails = getEvaluationDetails(evaluation, jobs, modules);

//         res.status(200).json(evaluationWithDetails);
//     } catch (error) {
//         console.error(error);
//         next(new BadRequestError());
//     }
// }

// helper function to get module and job details
// function getEvaluationDetails(evaluation: IEvaluation, jobs: any[], modules: any[]) {
//     return {
//         ...evaluation,
//         jobEvaluations: evaluation.jobEvaluations.map(jobEval => ({
//             ...jobEval,
//             job: jobs.find(j => j.jobId === jobEval.job.jobId) || { jobId: jobEval.job.jobId },
//             candidates: jobEval.candidates.map(candidate => ({
//                 acronym: candidate.acronym,
//                 ...modules.find(m => m.acronym === candidate.acronym)
//             })),
//             rankedModules: jobEval.rankedModules.map(ranked => ({
//                 acronym: ranked.acronym,
//                 ranking: ranked.ranking,
//                 ...modules.find(m => m.acronym === ranked.acronym)
//             }))
//         }))
//     };
// }