export interface FnUser {
    metadata: FnStudyprogramme[],
    studyPath?: {
        completedModules: FnCompletedModule[],
        completedCourses: FnCompletedCourse[]
    }
}

export interface FnStudyprogramme {
    spId: string,
    poVersion: number,
    name: string,
    faculty: string,
    mhbId: string,
    mhbVersion: number,
    status: string,
    duration: number,
    maxEcts: number,
    summedGrade: number,
    semesters: FnStudentSemester[]
}

interface FnStudentSemester {
    semester: string, // semester as apnr
    type: string,
    count: number,
    startSemester: boolean,
    endSemester: boolean,
    partTime: boolean
}

export interface FnCompletedModule {
    mId: string,
    version: string,
    acronym: string,
    name: string,
    ects: number,
    moduleGroups: { mgId: string, version: string }[],
    grade: number | null,
    status: string,
    semesterBegin: string, // semester as apnr
    semesterEnd: string, // semester as apnr
    semester: string, // semester as apnr
    examAttempts: ExamAttemp[]
}

export interface FnCompletedCourse {
    id: string,
    nr: string,
    waitingList: number | null,
    name: string,
    semester: string // semester as apnr
}

interface ExamAttemp {
    count: number,
    grade: number | null,
    semester: string, // semester as apnr
    name: string,
    remark: string
}