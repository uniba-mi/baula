export declare const metaDataTemplate: (string | {
    spId: string;
    poVersion: string;
    name: string;
    faculty: string;
    mhbId: string;
    mhbVersion: string;
    status: string;
    duration: string;
    maxEcts: string;
    summedGrade: string;
    semesters: (string | {
        semester: string;
        type: string;
        count: string;
        startSemester: string;
        endSemester: string;
        partTime: string;
    })[];
})[];
export declare const studyPathTemplate: {
    completedModules: (string | {
        mId: string;
        version: string;
        acronym: string;
        name: string;
        ects: string;
        moduleGroups: (string | {
            mgId: string;
            version: string;
        })[];
        grade: string;
        status: string;
        semesterBegin: string;
        semesterEnd: string;
        semester: string;
        examAttempts: (string | {
            count: string;
            grade: string;
            semester: string;
            name: string;
            remark: string;
        })[];
    })[];
    completedCourses: (string | {
        id: string;
        nr: string;
        waitingList: string;
        name: string;
        semester: string;
    })[];
};
