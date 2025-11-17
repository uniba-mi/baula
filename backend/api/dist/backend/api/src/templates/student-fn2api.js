"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyPathTemplate = exports.metaDataTemplate = void 0;
exports.metaDataTemplate = [
    "//Studentfach",
    {
        spId: "@Studfach",
        poVersion: 'number(Po[@Role="AktuellePo"]/@Po)',
        name: "Studfach.Bez",
        faculty: "Fak/Kurzbez",
        mhbId: 'number(Po[@Role="AktuellePo"]/Modulhandbuch/@Modulhandbuch)',
        mhbVersion: 'number(Po[@Role="AktuellePo"]/Modulhandbuch/@Version)',
        status: "Statusstudent/Bez",
        duration: "number(Po/Regeldauer)",
        maxEcts: "number(Po/Volumen)",
        summedGrade: 'number(translate(ErrechneteNoteAusStudiumMitAusnahmeZr,",","."))',
        semesters: [
            "//StudentfachSem",
            {
                semester: "Semester.Apnr",
                type: "Semestertyp/Bez",
                count: "number(Fachsem)",
                startSemester: "boolean(number(Immasem))",
                endSemester: "boolean(number(Exmasem))",
                partTime: "boolean(number(Teilzeit))",
            },
        ],
    },
];
exports.studyPathTemplate = {
    completedModules: [
        "//StudienModul",
        {
            mId: "@StudienModul",
            version: "@Version",
            acronym: "KurzBez",
            name: "Bez",
            ects: 'number(translate(EctsPunkte,",","."))',
            moduleGroups: [
                "ModulGruppen/GruppeModul",
                {
                    mgId: "@Modulgruppe",
                    version: "@VersionGruppe",
                },
            ],
            grade: 'number(translate(Studium/Note,",","."))',
            status: "Studium/StatusStudium/Bez",
            semesterBegin: 'Studium/Semester[@Role="SemesterBySemesterBeginn"]/Apnr',
            semesterEnd: 'Studium/Semester[@Role="SemesterBySemesterEnde"]/Apnr',
            semester: 'Studium/Semester[@Role="SemesterJuengsteAblegung"]/Apnr',
            examAttempts: [
                "Studium/Prfstds/Prfstd",
                {
                    count: "number(Anzahl)",
                    grade: 'number(translate(Note,",","."))',
                    semester: "Semestertermin/Semester/Apnr",
                    name: "Teilprf/Bez",
                    remark: "Prfbem",
                },
            ],
        },
    ],
    completedCourses: [
        "//LvStudent",
        {
            id: "@Lv",
            nr: "Lv.Lvnr",
            waitingList: "number(Wlplatz)",
            name: "Lv.Bez",
            semester: "Semester.Apnr",
        },
    ],
};
