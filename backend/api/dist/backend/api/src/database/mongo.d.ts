import mongoose, { HydratedDocument, Query, Model } from "mongoose";
import { Semesterplan as ISemesterplan } from "../../../../interfaces/semesterplan";
import { Studyplan as IStudyplan } from "../../../../interfaces/studyplan";
import { Recommendation as IRecommendation } from "../../../../interfaces/recommendation";
import { Embedding as IEmbedding } from "../../../../interfaces/embedding";
import { ModuleEmbedding as IModEmbedding } from "../../../../interfaces/embedding";
import { LongTermEvaluation as ILongTermEvaluation } from "../../../../interfaces/longTermEvaluation";
import { Topic as ITopic } from "../../../../interfaces/topic";
import { UserServer as IUser } from "../../../../interfaces/user";
import { Evaluation as IEvaluation } from "../../../../interfaces/evaluation";
export declare const connection: Promise<typeof mongoose>;
type UserModelType = Model<IUser, UserQueryHelpers>;
type UserModelQuery = Query<any, HydratedDocument<IUser>, UserQueryHelpers> & UserQueryHelpers;
interface UserQueryHelpers {
    byShibId(this: UserModelQuery, shibId: String): UserModelQuery;
}
export declare const Semesterplan: mongoose.Model<ISemesterplan, {}, {}, {}, mongoose.Document<unknown, {}, ISemesterplan, {}, {}> & ISemesterplan & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const Studyplan: mongoose.Model<IStudyplan, {}, {}, {}, mongoose.Document<unknown, {}, IStudyplan, {}, {}> & IStudyplan & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const User: UserModelType;
export declare const TopicM: mongoose.Model<ITopic, {}, {}, {}, mongoose.Document<unknown, {}, ITopic, {}, {}> & ITopic & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const Recommendation: mongoose.Model<IRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IRecommendation, {}, {}> & IRecommendation & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const Embedding: mongoose.Model<IEmbedding, {}, {}, {}, mongoose.Document<unknown, {}, IEmbedding, {}, {}> & IEmbedding & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const ModEmbedding: mongoose.Model<IModEmbedding, {}, {}, {}, mongoose.Document<unknown, {}, IModEmbedding, {}, {}> & IModEmbedding & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export declare const Evaluation: mongoose.Model<IEvaluation, {}, {}, {}, mongoose.Document<unknown, {}, IEvaluation, {}, {}> & IEvaluation & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const LongTermEvaluation: mongoose.Model<ILongTermEvaluation, {}, {}, {}, mongoose.Document<unknown, {}, ILongTermEvaluation, {}, {}> & ILongTermEvaluation & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export {};
