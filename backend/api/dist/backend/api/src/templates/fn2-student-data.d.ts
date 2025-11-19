export declare const userStudyprogrammes: (string | {
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
        semesterType: string;
        semesterCount: string;
        immaSem: string;
        exmaSem: string;
        partTime: string;
    })[];
})[];
export declare const importedModules: (string | {
    mId: string;
    version: string;
    acronym: string;
    name: string;
    ects: string;
    grade: string;
    status: string;
    semesterBegin: string;
    semesterEnd: string;
    semester: string;
    mgIds: (string | {
        mgId: string;
        version: string;
    })[];
    attempts: (string | {
        count: string;
        grade: string;
        semester: string;
        name: string;
        remark: string;
    })[];
})[];
export declare const importedCourses: (string | {
    id: string;
    name: string;
    semester: string;
})[];
