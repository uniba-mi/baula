"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importedCourses = exports.importedModules = exports.userStudyprogrammes = void 0;
exports.userStudyprogrammes = ['//Studentfach', {
        spId: '@Studfach',
        poVersion: 'number(Po[@Role="AktuellePo"]/@Po)',
        name: 'Studfach.Bez',
        faculty: 'Fak/Kurzbez',
        mhbId: 'number(Po[@Role="AktuellePo"]/Modulhandbuch/@Modulhandbuch)',
        mhbVersion: 'number(Po[@Role="AktuellePo"]/Modulhandbuch/@Version)',
        status: 'Statusstudent/Bez',
        duration: 'number(Po[@Role="AktuellePo"]/Regeldauer)',
        maxEcts: 'number(Po[@Role="AktuellePo"]/Volumen)',
        summedGrade: 'number(translate(ErrechneteNoteAusStudiumMitAusnahmeZr,",","."))',
        semesters: ['StudentfachSems/StudentfachSem', {
                semester: 'Semester.Apnr',
                semesterType: 'Semestertyp/Bez',
                semesterCount: 'number(Fachsem)',
                immaSem: 'boolean(number(Immasem))',
                exmaSem: 'boolean(number(Exmasem))',
                partTime: 'boolean(number(Teilzeit))',
            }]
    }];
exports.importedModules = ['//StudienModul', {
        mId: 'number(@StudienModul)',
        version: 'number(@Version)',
        acronym: 'KurzBez',
        name: 'Bez',
        ects: 'number(translate(EctsPunkte,",","."))',
        grade: 'number(translate(Studium/Note,",","."))',
        status: 'Studium/StatusStudium/Bez',
        semesterBegin: 'Studium/Semester[@Role="SemesterBySemesterBeginn"]/Apnr',
        semesterEnd: 'Studium/Semester[@Role="SemesterBySemesterEnde"]/Apnr',
        semester: 'Studium/Semester[@Role="SemesterJuengsteAblegung"]/Apnr',
        mgIds: ['ModulGruppen/GruppeModul', {
                mgId: 'number(@Modulgruppe)',
                version: 'number(@VersionGruppe)',
            }],
        attempts: ['Studium/Prfstds/Prfstd', {
                count: 'number(Anzahl)',
                grade: 'number(translate(Note,",","."))',
                semester: 'Semestertermin/Semester/Apnr',
                name: 'Teilprf/Bez',
                remark: 'Prfbem'
            }]
    }];
exports.importedCourses = ['//LvStudent', {
        id: 'Lv.Lvnr',
        name: 'Lv.Bez',
        semester: 'Semester.Apnr',
    }];
