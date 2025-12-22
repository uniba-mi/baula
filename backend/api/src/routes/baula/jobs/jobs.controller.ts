import { Request, Response, NextFunction } from "express";
import {
  jobModuleProposalKeyWordsRequest,
  getJobInformation,
  keywordRequest,
} from "../../../services/job-service";
import validator from "validator";
import { User, Recommendation } from "../../../database/mongo";
import mongoose from "mongoose";
import { UserServer } from "../../../../../../interfaces/user";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import { ExtendedJob, Job, Jobtemplate } from "../../../../../../interfaces/job";
import {
  validateAndReturnJobtemplate,
  validateObjectId,
} from "../../../shared/helpers/custom-validator";
import { RecommendedModule } from "../../../../../../interfaces/recommendation";
import { extractModules } from "../../../shared/helpers/module-helpers";
import path from "path";
import { readJsonFile } from "../../../shared/helpers/process-data-helper";

const jobDataFolderPath = path.join(__dirname, "../../../..", "staticdata");

// post function /crawling takes the url and returns the job information
export async function crawlJob(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const url = req.body.url ? req.body.url.toString() : undefined;

  if (url) {
    if (validator.isURL(url)) {
      try {
        /* const jobInformation: Jobtemplate = await getJobInformationAndKeywords(
          url,
          10
        ); */
        const jobInformation = await getJobInformation(url);
        return res.status(200).json(jobInformation);
      } catch (error) {
        next(new BadRequestError());
      }
    } else {
      next(new BadRequestError());
    }
  } else {
    next(new NotFoundError());
  }
}

// generate job keywords from job information
export async function generateJobKeywords(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get job information from request body
  const title = req.body.title;
  const description = req.body.description;

  if( !title || !description) {
    next(new BadRequestError("Job title or description is missing!"));
    return;
  }

  try {
    const keywords = await keywordRequest(
      title,
      description,
      10
    );
    return res.status(200).json(keywords);
  } catch (error) {
    next(new BadRequestError());
  }
  
}

// post function /job_proposal_keywords keyword list input, module list output
export async function recommendModulesToJob(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get job information and user from request
  const user = req.user as UserServer;
  const id =
    req.body.jobId && validateObjectId(req.body.jobId)
      ? req.body.jobId
      : undefined;

  // get mhbId and mhbVersion from user
  const mhbId = user.sps?.[0]?.mhbId;
  const mhbVersion = user.sps?.[0]?.mhbVersion;
  if (
    !mhbId ||
    !mhbVersion ||
    !validator.isAlphanumeric(mhbId, undefined, { ignore: "_-" }) ||
    !validator.isInt(mhbVersion.toString())
  ) {
    next(new BadRequestError("No mhbId or mhbVersion found!"));
    return;
  }
  const modules = await extractModules(mhbId, mhbVersion);
  const job = validateAndReturnJobtemplate({
    title: req.body.job.title,
    description: req.body.job.description.slice(0, 2000),
    inputMode: req.body.job.inputMode,
    keywords: req.body.job.keywords,
  });

  if (!job || !modules || !user.sps || !user.sps[0].spId) {
    next(new BadRequestError("Invalid job input or modules!"));
  } else {
    let savedJob: Job | null | undefined = await saveJob(user._id, job, id);
    if (savedJob) {
      try {
        const proposal:
          | {
              title: string;
              keywords: string[];
              recModules: { acronym: string; score: number }[];
            }
          | undefined =
          job.inputMode === "mock"
            ? await getMockedJobRecommendation(job, user.sps[0].spId)
            : await jobModuleProposalKeyWordsRequest(
                job.title,
                job.keywords,
                modules
              );
              
        if (proposal === undefined) {
          next(new NotFoundError("Keine Modulempfehlungen gefunden."));
          return;
        }
        await saveRecommendation(user, proposal, savedJob);
        // check for predefined jobs and return predefined recs
        return res.status(200).json({
          ...savedJob,
          recModules: proposal?.recModules,
        });
      } catch (error) {
        console.log(error);
        next(new BadRequestError());
      }
    } else {
      next(new BadRequestError());
    }
  }
}

/** Helper functions to save results to mongodb */
async function saveJob(
  uId: string,
  job: Jobtemplate,
  id?: string
): Promise<Job | null | undefined> {
  if (id) {
    // update job
    try {
      // update job in user
      await User.updateOne(
        { _id: uId, "jobs._id": id },
        {
          $set: {
            "jobs.$.keywords": job.keywords,
          },
        }
      );
      return {
        _id: id,
        embeddingId: "",
        ...job,
      };
    } catch (error) {
      return undefined;
    }
  } else {
    // save job
    try {
      // add job to user
      const newJob = {
        _id: new mongoose.Types.ObjectId().toString(),
        embeddingId: "",
        ...job,
      };
      await User.findByIdAndUpdate(
        uId,
        {
          $push: {
            jobs: {
              $each: [newJob],
              $position: 0,
            },
          },
        },
        { new: true }
      );
      return newJob;
    } catch (error) {
      return undefined;
    }
  }
}
// saves the result (mudule list + job) from moduleProposalKeywords
async function saveRecommendation(
  user: UserServer,
  result: {
    title: string;
    keywords: string[];
    recModules: { acronym: string; score: number }[];
  },
  job: Job
): Promise<ExtendedJob> {
  // find existing recommendations for user
  let recommendations = await Recommendation.findOne({
    userId: user._id,
  }).exec(); // current recommendations of user
  let recModules: RecommendedModule[] = []; // new recommendations
  // check if recommendations and recommendedMods exist
  if (recommendations && recommendations.recommendedMods) {
    // if recco exists, check if recommendedMods is not empty
    if (recommendations.recommendedMods.length > 0) {
      // reset recommendation of requested job to prevent incosistency if keywords change
      for (const recModule of recommendations.recommendedMods) {
        recModule.source = recModule.source.filter(
          (source) => source.identifier !== job._id
        );
      }
      recommendations.recommendedMods = recommendations.recommendedMods.filter(
        (recModule) => recModule.source.length > 0
      );

      // recommendations exists
      for (const module of result.recModules) {
        // check if module exists in recommendations
        const index = recommendations.recommendedMods.findIndex(
          (recModule) => recModule.acronym === module.acronym
        );
        if (index >= 0) {
          // module exists in recommendations
          const recModule = recommendations.recommendedMods[index];
          recModule.frequency = recModule.source.push({
            type: "job",
            identifier: job._id,
            score: module.score,
          });
          recModules.push(recModule);
        } else {
          // module does not exist in recommendations
          const newModule: RecommendedModule = createRecommendedModule(
            module.acronym,
            module.score,
            job._id
          );
          recModules.push(newModule);
          recommendations.recommendedMods.push(newModule);
        }
      }
    } else {
      // else if recommendedMods is empty
      // new recommendations
      for (const module of result.recModules) {
        const newModule: RecommendedModule = createRecommendedModule(
          module.acronym,
          module.score,
          job._id
        );
        recModules.push(newModule);
        recommendations.recommendedMods.push(newModule);
      }
    }
    try {
      await recommendations.save();
      return {
        ...job,
        recModules: recModules,
      };
    } catch (error) {
      console.error("Error saving recommendation or updating user:", error);
      throw new Error("Error saving recommendation or updating user"); // Fehlerbehandlung
    }
  } else {
    // if no recommendations currently exist
    for (const module of result.recModules) {
      const newModule: RecommendedModule = createRecommendedModule(
        module.acronym,
        module.score,
        job._id
      );
      recModules.push(newModule);
    }

    let recommendation = new Recommendation({
      userId: user._id,
      _id: job._id,
      jobCandidates: undefined,
      topicCandidates: undefined,
      recommendedMods: recModules,
    });

    try {
      await recommendation.save();
      return {
        ...job,
        recModules: recModules,
      };
    } catch (error) {
      console.error("Error saving recommendation or updating user:", error);
      throw new Error("Error saving recommendation or updating user"); // Fehlerbehandlung
    }
  }
}

function createRecommendedModule(
  acronym: string,
  score: number,
  id: string
): RecommendedModule {
  return {
    acronym: acronym,
    source: [{ type: "job", identifier: id, score: score }],
    weight: 1,
  };
}

async function getMockedJobRecommendation(
  job: Jobtemplate,
  studyprogramme: string
): Promise<{
  title: string;
  keywords: string[];
  recModules: { acronym: string; score: number }[];
}> {
  const result = await readJsonFile<{
    jobs: {
      title: string;
      recModules: { acronym: string; score: number; studyprogramme: string }[];
    }[];
  }>(`${jobDataFolderPath}/module-recommendations.json`);
  return new Promise((resolve, reject) => {
    if (result.jobs) {
      const jobData = result.jobs.find((j) => j.title === job.title);
      if (jobData && jobData.recModules) {
        resolve({
          title: job.title,
          keywords: job.keywords,
          recModules: jobData.recModules.filter(
            (m) => m.studyprogramme === studyprogramme
          ),
        });
      } else {
        resolve({
          title: job.title,
          keywords: job.keywords,
          recModules: [],
        });
      }
    }
  });
}
