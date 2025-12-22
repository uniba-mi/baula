import { Types } from "mongoose";
import { StudyPlan } from "../../database/mongo";
import { PathModule } from "../../../../../interfaces/study-path";
import { Semester } from "../../../../../interfaces/semester";
import { validateObjectId } from "./custom-validator";

export const findStudyPlan = async (studyPlanId: string) => {
    if (validateObjectId(studyPlanId)) {
        return await StudyPlan.findById(studyPlanId).exec();
    } else {
        return undefined;
    }
};

export const findActiveStudyPlan = async (uId: string) => {
    return await StudyPlan.findOne({
        $and: [{ userId: uId }, { status: true }],
    });
};

// Get the latest plan filename based on semester type
export function getLatestPlanFilename(
    files: string[],
    semesterType: "w" | "s"
): string | undefined {
    let latestPlanFilename: string | undefined;
    let latestSemester: Semester | undefined;

    files.forEach((file) => {
        const match = file.match(/-(\d{4})([sw])/);
        if (match) {
            const semesterName = `${match[1]}${match[2]}`;
            const semester = new Semester(semesterName);

            if (semester.type === semesterType) {
                if (
                    !latestSemester ||
                    semester.year > latestSemester.year ||
                    (semester.year === latestSemester.year &&
                        semester.type === latestSemester.type)
                ) {
                    latestSemester = semester;
                    latestPlanFilename = file;
                }
            }
        }
    });

    return latestPlanFilename;
}

// helper  for finish semester - find matching module index
export function findMatchingModuleIndex(
    userModules: PathModule[],
    module: PathModule,
    moduleObjectId: Types.ObjectId | null
) {
    return userModules.findIndex((existingMod) => {
        // Case 1: Incoming module is NORMAL (!ug)
        if (!module.isUserGenerated) {
            // 1a: If matching ID, use this index
            if (
                moduleObjectId?.toString() &&
                existingMod._id &&
                moduleObjectId.toString() === existingMod._id.toString()
            ) {
                return true;
            }

            // 1b: If NORMAL module with matching acronym in the semester, use this index
            if (
                !existingMod.isUserGenerated &&
                existingMod.acronym === module.acronym &&
                existingMod.semester === module.semester
            ) {
                return true;
            }

            return false;
        }

        // Case 2: Incoming module is UG MOD (ug && !fn)
        if (module.isUserGenerated && !module.flexNowImported) {
            // 2a: If matching ID, use this index
            if (
                moduleObjectId?.toString() &&
                existingMod._id &&
                moduleObjectId.toString() === existingMod._id.toString()
            ) {
                return true;
            }

            return false;
        }

        // Case 3: Incoming module is FN MOD (ug && fn)
        if (module.isUserGenerated && module.flexNowImported) {
            // 3a: If matching ID, use this index
            if (
                moduleObjectId?.toString() &&
                existingMod._id &&
                moduleObjectId.toString() === existingMod._id.toString()
            ) {
                return true;
            }

            // 3b: If FN MOD with matching acronym in the semester, use this index
            if (
                existingMod.isUserGenerated &&
                existingMod.flexNowImported &&
                existingMod.acronym === module.acronym &&
                existingMod.semester === module.semester
            ) {
                return true;
            }

            return false;
        }

        return false;
    });
}