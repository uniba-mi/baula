import mongoose, {
  HydratedDocument,
  model,
  QueryWithHelpers,
  Schema,
  Model,
} from "mongoose";
import { SemesterPlan as ISemesterPlan } from "@interfaces/semester-plan";
import { ObjectId } from "mongodb";
import { StudyPlan as IStudyPlan } from "@interfaces/study-plan";
import { Recommendation as IRecommendation } from "@interfaces/recommendation";
import {
  Embedding as IEmbedding,
  ModuleEmbedding as IModEmbedding,
} from "@interfaces/embedding";
import { ExamAttempt as IExamAttempt } from "@interfaces/study-path";
import { LongTermEvaluation as ILongTermEvaluation } from "@interfaces/long-term-evaluation";
import { Topic as ITopic } from "@interfaces/topic";
import { UserServer as IUser } from "@interfaces/user";
import { Evaluation as IEvaluation } from "@interfaces/evaluation";
import { FeatureWish as IFeatureWish } from "@interfaces/feature-wish";
import { logger } from "../shared/utils/logger";

const uri = process.env.MONGO_DATABASE_URL;

if (!uri) {
  throw new Error("MONGO_DATABASE_URL environment variable is required");
}

// Enhanced MongoDB connection with pooling and retry options
export const connection = mongoose.connect(uri, {
  maxPoolSize: 100, 
  socketTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
  serverSelectionTimeoutMS: 5000, // 5 seconds
  retryWrites: true,
  retryReads: true,
  appName: "Baula-Backend",
}).catch((err) => {
  logger.error("MongoDB connection failed:", err);
  throw err;
});

// MongoDB Schemas -> Structure of the models
// longterm evaluation schema
const LongTermEvaluationSchema: Schema = new Schema<ILongTermEvaluation>(
  {
    personalCode: { type: String, required: true },
    evaluationCode: {
      type: String,
      required: true,
    },
    spName: String,
    semester: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },
    pu: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => {
          return (
            v.length === 4 && v.every((num: number) => num >= 0 && num <= 7)
          );
        },
        message: (props) =>
          `${props.value} muss genau 4 Werte zwischen 0 und 7 enthalten!`,
      },
    },
    peou: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => {
          return (
            v.length === 4 && v.every((num: number) => num >= 0 && num <= 7)
          );
        },
        message: (props) =>
          `${props.value} muss genau 4 Werte zwischen 0 und 7 enthalten!`,
      },
    },
    bi: {
      type: Number,
      required: true,
      min: 0,
      max: 7,
    },
    use: {
      type: String,
      enum: [
        "täglich",
        "mehrmals pro Woche",
        "einmal pro Woche",
        "seltener",
        "undefined",
      ],
      required: true,
    },
    nps: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

const SemesterPlanSchema: Schema = new Schema<ISemesterPlan>(
  {
    semester: {
      type: String,
      match: /\d{4}((w)|(s))/g,
      required: true,
    },
    isPastSemester: {
      type: Boolean,
      required: true,
    },
    modules: [String],
    userGeneratedModules: [
      {
        name: {
          type: String,
          maxlength: 1000,
          match: /[a-zA-Z0-9\s?.,&:]*/g,
        },
        acronym: {
          type: String,
          maxlength: 100,
        },
        ects: {
          type: Number,
          min: 0,
          max: 30,
        },
        notes: {
          type: String,
          maxlength: 1000,
          match: /[a-zA-Z0-9\s?.,&:]*/g,
        },
        status: {
          type: String,
          match: /(taken)|(failed)|(passed)|(open)/g,
        },
        flexNowImported: Boolean,
      },
    ],
    courses: [
      {
        id: String,
        name: String,
        status: String,
        ects: Number,
        sws: Number,
        contributeTo: String,
        contributeAs: String,
      },
    ],
    aimedEcts: {
      type: Number,
      min: 0,
      max: 210,
    },
    summedEcts: {
      type: Number,
      min: 0,
      max: 210,
    },
    expanded: {
      type: Boolean,
    },
    userId: {
      type: ObjectId,
      reference: "UserSchema",
      required: true,
    },
  },
  { timestamps: true },
);

const StudyPlanSchema: Schema = new Schema<IStudyPlan>(
  {
    name: String,
    status: Boolean,
    semesterPlans: [SemesterPlanSchema],
    userId: {
      type: ObjectId,
      reference: "UserSchema",
      required: true,
    },
  },
  { timestamps: true },
);

// Recommendation
const RecommendationSchema: Schema = new Schema<IRecommendation>(
  {
    recommendedMods: [
      // holds ranked list of module recommendations from different sources
      {
        acronym: {
          type: String,
          required: true,
          maxlength: 100,
        },
        source: [
          // where does recommended module come from?
          {
            type: {
              type: String,
              match:
                /(job)|(topic)|(interest)|(cohort)|(feedback_similarmods)/g, // or others
              required: true,
            },
            identifier: {
              type: String,
              required: true,
            },
            score: {
              // similarity score
              type: Number,
              min: 0,
              max: 1,
            },
          },
        ],
        weight: {
          // optional weighting factor
          type: Number,
          min: 0,
          max: 10,
        },
        position: {
          // position in ranking
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    userId: {
      type: ObjectId,
      reference: "UserSchema",
      required: true,
    },
  },
  { timestamps: true },
);

const TopicSchema: Schema = new Schema<ITopic>(
  {
    tId: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
      match: /[a-zA-Z0-9\s?.,&:]*/g,
    },
    keywords: {
      type: [String],
    },
    description: {
      type: String,
      match: /[a-zA-Z0-9\s?.,&:]*/g,
    },
    parentId: {
      type: String,
    },
    embeddingId: {
      type: String,
    },
  },
  { timestamps: true },
);

// all embeddings except for module embeddings with id as identifier, e. g. jobId
const EmbeddingSchema: Schema = new Schema<IEmbedding>(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    identifier: {
      type: String,
      required: true,
    },
    vector: {
      type: [Number],
      required: true,
      min: -1.0,
      max: 1.0,
    },
  },
  { timestamps: true },
);

const ModEmbeddingSchema: Schema = new Schema<IModEmbedding>(
  {
    _id: {
      type: String,
      required: true,
    },
    acronym: {
      type: String,
      required: true,
    },
    vector: {
      type: [Number],
      required: true,
      min: -1.0,
      max: 1.0,
    },
  },
  { timestamps: true },
);

// Query helpers for UserSchema
type UserModelType = Model<IUser, UserQueryHelpers>;
type UserModelQuery = QueryWithHelpers<
  any,
  HydratedDocument<IUser>,
  UserQueryHelpers
>;
interface UserQueryHelpers {
  byShibId(shibId: string): UserModelQuery;
}

// ein Pruefungsversuch aus FlexNow (Prfstd). examId, name und remark sind bewusst
// nicht required: camaro liefert fuer fehlende Knoten einen Leerstring, den Mongoose
// als "nicht gesetzt" wertet - required wuerde beim Speichern einen ValidationError
// werfen, obwohl der Versuch selbst valide ist.
const ExamAttemptSchema: Schema = new Schema<IExamAttempt>(
  {
    examId: String,
    name: String,
    count: {
      type: Number,
      required: true,
    },
    grade: Number,
    semester: {
      type: String,
      match: /(\d{4}((w)|(s)))/g,
    },
    status: {
      type: String,
      match: /(taken)|(failed)|(passed)|(open)/g,
    },
    remark: String,
    flexNowImported: Boolean,
  },
  // Versuche sind Werte innerhalb eines Moduls, keine eigenstaendigen Dokumente
  { _id: false },
);

// UserSchema
const UserSchema = new Schema<IUser, UserModelType, {}, UserQueryHelpers>(
  {
    shibId: {
      type: String,
      unique: true,
      trim: true,
      minLength: 32,
      maxLength: 32,
      required: true,
    },
    roles: [
      {
        type: String,
        enum: [
          "admin",
          "student",
          "employee",
          "staff",
          "member",
          "faculty",
          "demo",
          "advisor",
        ],
        required: true,
      },
    ],
    authType: {
      type: String,
      enum: ["local", "saml"],
      required: true,
    },
    interests: [String],
    completedModules: [
      {
        mgId: String,
        acronym: String,
        name: String,
        ects: Number,
        grade: Number,
        status: {
          type: String,
          match: /(taken)|(failed)|(passed)|(open)/g,
        },
        examAttempts: [ExamAttemptSchema],
        semester: {
          type: String,
          match: /(\d{4}((w)|(s)))/g,
        },
        notes: {
          type: String,
          maxlength: 1000,
          match: /[a-zA-Z0-9\s?.,&:]*/g,
        },
        isUserGenerated: Boolean,
        flexNowImported: Boolean,
      },
    ],
    startSemester: {
      type: String,
      match: /\d{4}((w)|(s))/g,
    },
    duration: {
      type: Number,
      min: 3,
      max: 20,
    },
    maxEcts: {
      type: Number,
      min: 1,
      max: 300,
    },
    sps: [
      {
        spId: String,
        poVersion: Number,
        name: String,
        faculty: String,
        mhbId: String,
        mhbVersion: Number,
        status: String,
        startSemster: String,
        duration: Number,
        maxEcts: Number,
      },
    ],
    fulltime: {
      type: Boolean,
      required: true,
    },
    dashboardSettings: [
      {
        key: String,
        visible: Boolean,
      },
    ],
    timetableSettings: [
      {
        timetableId: {
          type: String,
          enum: ["dashboard", "semesterplan"],
        },
        showWeekends: Boolean,
        selectedView: String,
      },
    ],
    studyPlanSettings: {
      displayGrades: Boolean,
      displayProgressBar: Boolean,
    },
    favouriteModulesAcronyms: [String],
    excludedModulesAcronyms: [String],
    hints: [
      {
        key: String,
        hasConfirmed: Boolean,
      },
    ],
    // timestamps in-built does not work for nested structures
    consents: [
      {
        ctype: {
          type: String,
          required: true,
        },
        hasConfirmed: {
          type: Boolean,
          required: true,
        },
        hasResponded: {
          type: Boolean,
        },
        timestamp: {
          type: Date,
          required: true,
        },
      },
    ],
    topics: [String],
    jobs: [
      // save jobs for user
      {
        title: {
          type: String,
          required: true,
          maxlength: 1000,
          match: /[a-zA-Z0-9\s?.,&:]*/g,
        },
        description: {
          type: String,
          maxlength: 2000,
          match: /[a-zA-Z0-9\s?.,&:]*/g,
        },
        keywords: {
          type: [String],
        },
        inputMode: {
          type: String,
          required: true,
          match: /(url)|(mock)/g,
        },
        embeddingId: {
          type: String,
        },
      },
    ],
    moduleFeedback: [
      {
        acronym: {
          type: String,
          required: true,
        },
        similarmods: {
          type: Number,
        },
        similarchair: {
          type: Number,
        },
        priorknowledge: {
          type: Number,
        },
        contentmatch: {
          type: Number,
        },
      },
    ],
    // competence aims
    compAims: {
      type: [
        {
          compId: String,
          aim: Number,
          standard: String,
          parent: {
            type: String,
            required: false,
          },
        },
      ],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);
UserSchema.query.byShibId = function (
  this: UserModelQuery,
  shibId: string,
): UserModelQuery {
  return this.findOne({ shibId: shibId });
};

// Evaluation
const EvaluationSchema: Schema = new Schema<IEvaluation>(
  {
    spId: {
      type: String,
      required: true,
      unique: true,
    },
    jobEvaluations: [
      {
        job: {
          jobId: { type: String, required: true },
        },
        candidates: [
          {
            acronym: { type: String, required: true },
          },
        ],
        rankedModules: [
          {
            acronym: { type: String, required: true },
            ranking: { type: Number, min: 0, max: 100, required: true },
          },
        ],
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Feature Wish
const FeatureWishSchema: Schema = new Schema<IFeatureWish>(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    createdAt: Date,
    title: String,
    description: String,
    isAllowed: Boolean,
    likedBy: [
      {
        type: ObjectId,
        reference: "UserSchema",
        required: true,
      },
    ],
    createdBy: {
      type: ObjectId,
      reference: "UserSchema",
    },
    icon: String,
    adminMessage: String,
    tags: [String],
  },
  { timestamps: true },
);

// Create models
export const SemesterPlan = model<ISemesterPlan>(
  "Semesterplan",
  SemesterPlanSchema,
);
export const StudyPlan = model<IStudyPlan>("Studyplan", StudyPlanSchema);
export const User = model<IUser, UserModelType>("User", UserSchema);
export const TopicM = model<ITopic>("Topic", TopicSchema);
export const Recommendation = model<IRecommendation>(
  "Recommendation",
  RecommendationSchema,
);
export const Embedding = model<IEmbedding>("Embedding", EmbeddingSchema);
export const ModEmbedding = model<IModEmbedding>(
  "ModEmbedding",
  ModEmbeddingSchema,
);
export const Evaluation = mongoose.model<IEvaluation>(
  "Evaluation",
  EvaluationSchema,
);
export const LongTermEvaluation = model<ILongTermEvaluation>(
  "LongTermEvaluation",
  LongTermEvaluationSchema,
);
export const FeatureWish = model<IFeatureWish>(
  "FeatureWish",
  FeatureWishSchema,
);
