import { Types } from "mongoose";
import { PathModule } from "../../study-path";
export declare const findStudyPlan: (studyPlanId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../../study-plan").StudyPlan, {}, {}> & import("../../study-plan").StudyPlan & Required<{
    _id: string;
}> & {
    __v: number;
}) | null | undefined>;
export declare const findActiveStudyPlan: (uId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../../study-plan").StudyPlan, {}, {}> & import("../../study-plan").StudyPlan & Required<{
    _id: string;
}> & {
    __v: number;
}) | null>;
export declare function getLatestPlanFilename(files: string[], semesterType: "w" | "s"): string | undefined;
export declare function findMatchingModuleIndex(userModules: PathModule[], module: PathModule, moduleObjectId: Types.ObjectId | null): number;
