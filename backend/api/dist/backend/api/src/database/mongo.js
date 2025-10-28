"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongTermEvaluation = exports.Evaluation = exports.ModEmbedding = exports.Embedding = exports.Recommendation = exports.TopicM = exports.User = exports.Studyplan = exports.Semesterplan = exports.connection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const mongodb_1 = require("mongodb");
//dotenv for custom environment variables
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
//dotenv.config({ path: "./database/.env" });
const envFile = `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({
    path: path_1.default.resolve(__dirname, "../../", "environment", envFile),
});
const uri = process.env.MONGO_DATABASE_URL
    ? process.env.MONGO_DATABASE_URL.toString()
    : "";
exports.connection = mongoose_1.default.connect(uri);
// MongoDB Schemas -> Structure of the models
// longterm evaluation schema
const LongTermEvaluationSchema = new mongoose_1.Schema({
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
                return (v.length === 4 && v.every((num) => num >= 0 && num <= 7));
            },
            message: (props) => `${props.value} muss genau 4 Werte zwischen 0 und 7 enthalten!`,
        },
    },
    peou: {
        type: [Number],
        required: true,
        validate: {
            validator: (v) => {
                return (v.length === 4 && v.every((num) => num >= 0 && num <= 7));
            },
            message: (props) => `${props.value} muss genau 4 Werte zwischen 0 und 7 enthalten!`,
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
}, { timestamps: true });
// Semesterplan
const SemesterplanSchema = new mongoose_1.Schema({
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
        type: mongodb_1.ObjectId,
        reference: "UserSchema",
        required: true,
    },
}, { timestamps: true });
// Studyplan
const StudyplanSchema = new mongoose_1.Schema({
    name: String,
    status: Boolean,
    semesterPlans: [SemesterplanSchema],
    userId: {
        type: mongodb_1.ObjectId,
        reference: "UserSchema",
        required: true,
    },
}, { timestamps: true });
// Recommendation
const RecommendationSchema = new mongoose_1.Schema({
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
                        match: /(job)|(topic)|(interest)|(cohort)|(feedback_similarmods)/g, // or others
                        required: true
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
        type: mongodb_1.ObjectId,
        reference: "UserSchema",
        required: true,
    },
}, { timestamps: true });
const TopicSchema = new mongoose_1.Schema({
    tId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, { timestamps: true });
// all embeddings except for module embeddings with id as identifier, e. g. jobId
const EmbeddingSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
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
}, { timestamps: true });
const ModEmbeddingSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// UserSchema
const UserSchema = new mongoose_1.Schema({
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
            // exams: [ExamSchema],
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
    timetableSettings: [{ showWeekends: Boolean }],
    favouriteModulesAcronyms: [String],
    notInterestingModulesAcronyms: [String],
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
}, {
    timestamps: true,
});
UserSchema.query.byShibId = function (shibId) {
    return this.findOne({ shibId: shibId });
};
// Evaluation
const EvaluationSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Create models
exports.Semesterplan = (0, mongoose_1.model)("Semesterplan", SemesterplanSchema);
exports.Studyplan = (0, mongoose_1.model)("Studyplan", StudyplanSchema);
exports.User = (0, mongoose_1.model)("User", UserSchema);
exports.TopicM = (0, mongoose_1.model)("Topic", TopicSchema);
exports.Recommendation = (0, mongoose_1.model)("Recommendation", RecommendationSchema);
exports.Embedding = (0, mongoose_1.model)("Embedding", EmbeddingSchema);
exports.ModEmbedding = (0, mongoose_1.model)("ModEmbedding", ModEmbeddingSchema);
exports.Evaluation = mongoose_1.default.model("Evaluation", EvaluationSchema);
exports.LongTermEvaluation = (0, mongoose_1.model)("LongTermEvaluation", LongTermEvaluationSchema);
