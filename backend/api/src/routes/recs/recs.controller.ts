import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import { RecommendedModule, Source, Recommendation as IRecommendation } from '../../../../../interfaces/recommendation';
import { Embedding, ModEmbedding, Recommendation, TopicM } from "../../database/mongo";
import { BadRequestError, NotFoundError } from "../../shared/error";
import { Topic } from "../../../../../interfaces/topic";
import { generateTopicModuleRecommendationsPreGenerated } from "../../services/topicService";
import { generateFeedbackBasedRecommendations } from "../../services/feedbackService";
import { UserServer } from "../../../../../interfaces/user";
import validator from "validator";
import { extractModules } from "../../shared/helpers/moduleHelpers";

const router = express.Router();
router.use(express.json());

/**
 * Generic helper function. Reads a JSON file and parses it into a JS object.
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {Promise<T>} - Promise with parsed JSON data as type T.
 * @template T - The type of the expected data structure that the JSON file contains.
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data.toString()) as T;
        resolve(jsonData);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

export async function getTopicTree(req: Request, res: Response, next: NextFunction) {
  try {
    const topics = await TopicM.find();

    // create map for lookup by tId
    const topicMap: { [key: string]: Topic } = {};
    topics.forEach((topic) => {
      topicMap[topic.tId] = {
        tId: topic.tId,
        name: topic.name,
        keywords: topic.keywords || [],
        description: topic.description,
        embeddingId: topic.embeddingId || undefined,
        parentId: topic.parentId,
        createdAt: topic.createdAt || undefined,
        updatedAt: topic.updatedAt || undefined,
        children: [],
      };
    });

    // build tree structure
    const rootTopics: Topic[] = [];
    Object.values(topicMap).forEach((topic) => {
      if (topic.parentId && topicMap[topic.parentId]) {
        topicMap[topic.parentId].children!.push(topic);
      } else {
        rootTopics.push(topic);
      }
    });

    res.status(200).json({ topics: rootTopics });
  } catch (error) {
    next(new BadRequestError('Fehler beim Abrufen des Themenbaums'));
  }
}

export async function getTopicChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const topics = await TopicM.find({ parentId: { $ne: null } });
    res.status(200).json(topics);
  } catch (error) {
    next(new BadRequestError('Fehler beim Abrufen der Themen'));
  }
}

/* Pre-Generated Embeddings */
export async function recommendModulesByTopicsPreGenerated(req: Request, res: Response, next: NextFunction) {
  const { tIds } = req.body;

  if (!Array.isArray(tIds)) {
    return next(new BadRequestError("Invalid topic IDs."));
  }

  try {
    // Step 1: Validate user and extract MHB information
    const user = req.user as UserServer;
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

    // Empty topics case: Save with empty topics to clear existing recommendations
    if (tIds.length === 0) {
      const savedRecommendation = await saveTopicRecommendation(
        user,
        { recModules: [] },
        []
      );

      return res.status(200).json(savedRecommendation);
    }

    // Step 2: Fetch topics and validate
    const topics = await TopicM.find({ tId: { $in: tIds } });
    if (topics.length === 0) {
      return next(new NotFoundError("No topics found for the provided IDs."));
    }

    // Step 3: Extract modules using MHB ID and version
    const modules = await extractModules(mhbId, mhbVersion);
    if (!modules || modules.length === 0) {
      return next(new NotFoundError("No modules found for the given MHB information."));
    }

    // Step 4: Fetch pre-generated embeddings for modules and topics
    const topicEmbeddings = await Embedding.find({
      identifier: { $in: tIds }
    });

    if (topicEmbeddings.length === 0) {
      return next(new NotFoundError("No embeddings found for the selected topics."));
    }

    const moduleAcronyms = modules.map(module => module.acronym);

    // Fetch module embeddings from ModEmbeddings
    const moduleEmbeddings = await ModEmbedding.find({
      acronym: { $in: moduleAcronyms }
    });

    if (moduleEmbeddings.length === 0) {
      return next(new NotFoundError("No embeddings found for available modules."));
    }

    // Step 5: Prepare data for recommendation function
    const topicsForRecommendation = topics.map(topic => {

      const embedding = topicEmbeddings.find(emb => emb.identifier === topic.tId);

      return {
        tId: topic.tId,
        name: topic.name,
        description: topic.description || "",
        vector: embedding?.vector || []
      };
    }).filter(topic => topic.vector.length > 0);

    const modulesForRecommendation = modules.map(module => {
      const embedding = moduleEmbeddings.find(emb => emb.acronym === module.acronym);
      return {
        acronym: module.acronym,
        name: module.name,
        content: module.content || "",
        skills: module.skills || "",
        vector: embedding?.vector || []
      };
    }).filter(module => module.vector.length > 0);

    if (topicsForRecommendation.length === 0) {
      return next(new Error("No valid topic embeddings found for recommendation."));
    }

    if (modulesForRecommendation.length === 0) {
      return next(new Error("No valid module embeddings found for recommendation."));
    }

    // Step 6: Call Python API for recommendations
    const recommendations = await generateTopicModuleRecommendationsPreGenerated(
      topicsForRecommendation,
      modulesForRecommendation
    );

    if (!recommendations || !recommendations.recModules) {
      return next(new Error("Failed to generate module recommendations."));
    }

    // Step 7: Save recommendations
    const savedRecommendation = await saveTopicRecommendation(
      user,
      recommendations,
      topics
    );

    res.status(200).json(savedRecommendation)
  } catch (error) {
    console.error("ERROR:", (error as Error).message);
    console.error("Error generating recommendations:", error);
    next(new BadRequestError("Failed to generate recommendations"));
  }
}

interface RecommendationResult {
  recModules: Array<{
    acronym: string;
    score: number;
    frequency?: number;
    sources: Array<{
      identifier: string;
      score: number;
    }>;
  }>;
}

// saves the result (module list + topics) from topic recommendation process
async function saveTopicRecommendation(
  user: UserServer,
  result: RecommendationResult,
  topics: Topic[]
): Promise<IRecommendation> {

  if (!user || !user._id) {
    throw new Error("Invalid user provided");
  }

  if (!result || !Array.isArray(result.recModules)) {
    throw new Error("Invalid recommendation result");
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

  // remove all topic-based sources but preserve others if topics array is empty
  if (!Array.isArray(topics) || topics.length === 0) {
    if (recommendations.recommendedMods.length > 0) {
      for (const recModule of recommendations.recommendedMods) {
        if (!recModule.source) {
          recModule.source = [];
          continue;
        }

        const hasNonTopicSources = recModule.source.some(source => source.type !== "topic");

        recModule.source = recModule.source.filter(
          source => source.type !== "topic"
        );

        if (recModule.source.length > 0) {
          recModule.frequency = recModule.source.length;

          const totalScore = recModule.source.reduce(
            (sum, source) => sum + (typeof source.score === 'number' ? source.score : 0),
            0
          );
          recModule.score = totalScore / recModule.source.length;
        } else if (hasNonTopicSources) {
          recModule.score = 0;
        }
      }

      recommendations.recommendedMods = recommendations.recommendedMods.filter(
        recModule => Array.isArray(recModule.source) && recModule.source.length > 0
      );
    }

    await recommendations.save();
    return recommendations;
  }

  const topicMap = new Map<string, Topic>();
  topics.forEach(topic => {
    if (topic.tId) {
      topicMap.set(topic.tId, topic);
    }
  });

  const tIds = topics
    .map(topic => topic.tId)
    .filter(id => id !== undefined && id !== null);

  // remove existing sources for these topics
  if (recommendations.recommendedMods.length > 0) {
    for (const recModule of recommendations.recommendedMods) {
      if (!recModule.source) {
        recModule.source = [];
        continue;
      }

      recModule.source = recModule.source.filter(
        source => source.type !== "topic" || tIds.includes(source.identifier)
      );
    }

    // remove modules without sources
    recommendations.recommendedMods = recommendations.recommendedMods.filter(
      recModule => Array.isArray(recModule.source) && recModule.source.length > 0
    );
  }

  const processedModules: RecommendedModule[] = [];

  for (const moduleRec of result.recModules) {
    const existingModuleIndex = recommendations.recommendedMods.findIndex(
      m => m.acronym === moduleRec.acronym
    );

    if (existingModuleIndex >= 0) {
      const existingModule = recommendations.recommendedMods[existingModuleIndex];

      // Ensure source array exists
      if (!existingModule.source) {
        existingModule.source = [];
      }

      // Add new sources from topics
      for (const source of moduleRec.sources) {
        if (topicMap.has(source.identifier)) {
          const existingSourceIndex = existingModule.source.findIndex(
            existing => existing.type === "topic" && existing.identifier === source.identifier
          );

          if (existingSourceIndex === -1) {
            existingModule.source.push({
              type: "topic",
              identifier: source.identifier,
              score: source.score
            });
          }
        }
      }

      existingModule.frequency = existingModule.source.length;

      if (existingModule.source.length > 0) {
        const totalScore = existingModule.source.reduce(
          (sum, source) => sum + (typeof source.score === 'number' ? source.score : 0),
          0
        );
        existingModule.score = totalScore / existingModule.source.length;
      } else {
        existingModule.score = 0;
      }

      processedModules.push(existingModule);
    } else {
      const validSources: Source[] = moduleRec.sources
        .filter(source => topicMap.has(source.identifier))
        .map(source => ({
          type: "topic",
          identifier: source.identifier,
          score: source.score
        }));

      const newModule: RecommendedModule = {
        acronym: moduleRec.acronym,
        source: validSources,
        frequency: validSources.length,
        score: moduleRec.score
      };

      recommendations.recommendedMods.push(newModule);
      processedModules.push(newModule);
    }
  }

  try {
    await recommendations.save();
    return recommendations;
  } catch (error) {
    console.error("Error saving recommendations:", error);
    console.error("Save ERROR:", error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to save recommendations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getPersonalRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as UserServer;
    const recommendations = await Recommendation.find({ userId: user._id });
    res.status(200).json(recommendations);
  } catch (error) {
    next(new BadRequestError('Fehler beim Abruf der Empfehlung'));
  }
}

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

interface FeedbackRecommendationResult {
  recModules: Array<{
    acronym: string;
    score: number;
  }>;
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