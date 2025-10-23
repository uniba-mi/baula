export interface Report {
    allUsers: number,
    activeUsers: number,
    lastActiveUsersHistory: Frequency[],
    frequencyModuleStatus: Frequency[],
    frequencyStudyProgrammes: Frequency[],
    frequencyDuration: Frequency[],
    frequencyStartSemester: Frequency[],
    frequencyCompletedModules: Frequency[],
    frequencyModulesAsCompleted: Frequency[],
    frequencyStudyPlans: number,
    frequencyStudyPlansClustered: Frequency[],
    frequencyPlannedCourses: CourseFrequency[],
}

interface CourseFrequency extends Frequency {
    id: string,
    semester: string,
}

interface Frequency {
    name: string,
    count: number,
}