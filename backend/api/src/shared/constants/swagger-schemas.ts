/**
 * Centralized Swagger schema definitions
 */
const swaggerSchemas = {

    // ==========================================
    // Shared Schemas
    // ==========================================

    Error: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'An error occurred'
            },
            code: {
                type: 'string',
                example: 'ERROR_CODE'
            }
        }
    },
};

export const swaggerBaulaSchema = {
    ...swaggerSchemas,
    // ==========================================
    // Prisma Schemas
    // ==========================================
    Department: {
        type: 'object',
        properties: {
            shortName: {
                type: 'string',
                description: 'Department short identifier',
                example: 'WIAI'
            },
            name: {
                type: 'string',
                description: 'Full department name',
                example: 'Wirtschaftsinformatik und Angewandte Informatik'
            }
        }
    },

    StudyProgramme: {
        type: 'object',
        properties: {
            spId: {
                type: 'string',
                description: 'Study programme ID',
                example: 'BAAng'
            },
            poVersion: {
                type: 'integer',
                description: 'PO (Prüfungsordnung) version number',
                example: 4
            },
            name: {
                type: 'string',
                description: 'Programme name',
                example: 'Bachelorstudiengang Angewandte Informatik'
            },
            desc: {
                type: 'string',
                description: 'Programme description',
                example: 'StuFPO vom 20.08.2010 in der ÄS vom 11.10.2017'
            },
            date: {
                type: 'string',
                description: 'Programme date',
                example: '30.09.2011'
            },
            faculty: {
                type: 'string',
                description: 'Faculty short name',
                example: 'WIAI'
            },
            dep: {
                $ref: '#/components/schemas/Department'
            },
            mhbs: {
                type: 'array',
                description: 'Module handbooks (Modulhandbücher)',
                items: {
                    $ref: '#/components/schemas/ModuleHandbook'
                }
            }
        }
    },

    ModuleHandbook: {
        type: 'object',
        description: 'Module handbook (Modulhandbuch)',
        properties: {
            mhbId: {
                type: 'string',
                description: 'Module handbook ID',
                example: 'MHB_BAAng_2020'
            },
            name: {
                type: 'string',
                description: 'Handbook name',
                example: 'Modulhandbuch Angewandte Informatik'
            },
            desc: {
                type: 'string',
                description: 'Handbook description',
                example: 'Modulhandbuch für den Bachelorstudiengang Angewandte Informatik'
            },
            version: {
                type: 'integer',
                description: 'Handbook version',
                example: 1
            },
            semester: {
                type: 'string',
                description: 'Semester identifier',
                example: '2024w'
            },
            spId: {
                type: 'string',
                description: 'Associated study programme ID',
                example: 'BAAng'
            },
            poVersion: {
                type: 'integer',
                description: 'Associated PO version',
                example: 4
            }
        }
    },

    ModuleGroup: {
        type: 'object',
        description: 'Module group (Modulgruppe)',
        properties: {
            mgId: {
                type: 'string',
                description: 'Module group ID',
                example: 'MG_001'
            },
            version: {
                type: 'integer',
                example: 1
            },
            name: {
                type: 'string',
                description: 'Module group name',
                example: 'Pflichtmodule'
            },
            fullName: {
                type: 'string',
                description: 'Full module group name',
                example: 'Pflichtmodule Informatik'
            },
            desc: {
                type: 'string',
                description: 'Module group description',
                example: 'Pflichtmodule für den Informatik-Studiengang'
            },
            ectsMin: {
                type: 'number',
                format: 'float',
                description: 'Minimum ECTS credits required',
                example: 30.0
            },
            ectsMax: {
                type: 'number',
                format: 'float',
                description: 'Maximum ECTS credits',
                example: 60.0
            },
            order: {
                type: 'number',
                format: 'float',
                description: 'Display order',
                example: 1.0
            }
        }
    },

    Module: {
        type: 'object',
        description: 'Study module',
        properties: {
            mId: {
                type: 'string',
                description: 'Module ID',
                example: 'M_SE1'
            },
            version: {
                type: 'integer',
                example: 1
            },
            acronym: {
                type: 'string',
                description: 'Module acronym',
                example: 'SE1'
            },
            name: {
                type: 'string',
                description: 'Module name',
                example: 'Software Engineering 1'
            },
            content: {
                type: 'string',
                description: 'Module content description',
                example: 'Einführung in die Softwareentwicklung, objektorientierte Programmierung, Design Patterns'
            },
            skills: {
                type: 'string',
                description: 'Skills acquired',
                example: 'Programmierung in Java, UML-Modellierung, Softwarearchitektur'
            },
            addInfo: {
                type: 'string',
                description: 'Additional information',
                example: 'Voraussetzung für SE2'
            },
            priorKnowledge: {
                type: 'string',
                description: 'Required prior knowledge',
                example: 'Grundlagen der Programmierung'
            },
            ects: {
                type: 'number',
                format: 'float',
                description: 'ECTS credits',
                example: 5.0
            },
            term: {
                type: 'string',
                description: 'Term/semester offered',
                example: 'WS'
            },
            recTerm: {
                type: 'string',
                description: 'Recommended semester',
                example: '3'
            },
            duration: {
                type: 'string',
                description: 'Module duration',
                example: '1 Semester'
            },
            chair: {
                type: 'string',
                description: 'Responsible chair/department',
                example: 'Lehrstuhl für Softwaretechnik'
            },
            offerBegin: {
                type: 'string',
                description: 'Start of offering period',
                example: '2020w'
            },
            offerEnd: {
                type: 'string',
                description: 'End of offering period',
                example: null
            },
            workload: {
                type: 'string',
                description: 'Workload breakdown',
                example: '150h (60h Präsenz, 90h Selbststudium)'
            },
            prevModules: {
                type: 'object',
                description: 'Previous modules (dependencies)',
                example: {}
            },
            respPersonId: {
                type: 'string',
                description: 'Responsible person ID',
                example: 'P_001'
            }
        }
    },

    ModuleExam: {
        type: 'object',
        description: 'Module examination',
        properties: {
            meId: {
                type: 'integer',
                description: 'Module exam ID',
                example: 1
            },
            shortName: {
                type: 'string',
                description: 'Short exam name',
                example: 'Klausur'
            },
            name: {
                type: 'string',
                description: 'Full exam name',
                example: 'Schriftliche Prüfung'
            },
            desc: {
                type: 'string',
                description: 'Exam description',
                example: '90-minütige Klausur'
            },
            duration: {
                type: 'number',
                format: 'float',
                description: 'Exam duration in minutes',
                example: 90.0
            },
            share: {
                type: 'string',
                description: 'Share of final grade',
                example: '100%'
            },
            mId: {
                type: 'string',
                description: 'Associated module ID',
                example: 'M_SE1'
            },
            version: {
                type: 'integer',
                example: 1
            }
        }
    },

    ModuleCourse: {
        type: 'object',
        description: 'Module course component',
        properties: {
            mcId: {
                type: 'string',
                description: 'Module course ID',
                example: 'MC_SE1_VL'
            },
            name: {
                type: 'string',
                description: 'Course name',
                example: 'Software Engineering 1 - Vorlesung'
            },
            identifier: {
                type: 'object',
                description: 'Additional identifiers',
                example: {}
            },
            type: {
                type: 'string',
                description: 'Course type',
                example: 'Vorlesung'
            },
            language: {
                type: 'string',
                description: 'Course language',
                example: 'Deutsch'
            },
            term: {
                type: 'string',
                description: 'Term offered',
                example: 'WS'
            },
            order: {
                type: 'number',
                format: 'float',
                description: 'Display order',
                example: 1.0
            },
            compulsory: {
                type: 'boolean',
                description: 'Is compulsory',
                example: true
            },
            desc: {
                type: 'string',
                description: 'Course description',
                example: 'Vorlesung zu den Grundlagen des Software Engineering'
            },
            literature: {
                type: 'string',
                description: 'Recommended literature',
                example: 'Sommerville: Software Engineering'
            },
            ects: {
                type: 'number',
                format: 'float',
                example: 3.0
            },
            sws: {
                type: 'number',
                format: 'float',
                description: 'Semesterwochenstunden',
                example: 2.0
            }
        }
    },

    Person: {
        type: 'object',
        description: 'Person (lecturer, module responsible)',
        properties: {
            pId: {
                type: 'string',
                description: 'Person ID',
                example: 'P_001'
            },
            title: {
                type: 'string',
                description: 'Academic title',
                example: 'Prof. Dr.'
            },
            firstname: {
                type: 'string',
                example: 'Max'
            },
            lastname: {
                type: 'string',
                example: 'Mustermann'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'max.mustermann@uni-bamberg.de'
            },
            tel: {
                type: 'string',
                description: 'Telephone number',
                example: '+49 951 863-1234'
            },
            office: {
                type: 'string',
                description: 'Office location',
                example: 'WE5/01.234'
            }
        }
    },

    Course: {
        type: 'object',
        description: 'University course (from UnivIS)',
        properties: {
            id: {
                type: 'string',
                description: 'Course ID',
                example: 'C_2024w_001'
            },
            name: {
                type: 'string',
                description: 'Course name',
                example: 'Softwaretechnik-Praktikum'
            },
            short: {
                type: 'string',
                description: 'Short name',
                example: 'SWT-Praktikum'
            },
            organizational: {
                type: 'string',
                description: 'Organizational information',
                example: 'Anmeldung über FlexNow erforderlich'
            },
            desc: {
                type: 'string',
                description: 'Course description',
                example: 'Praktische Übungen zur Softwareentwicklung in Teams'
            },
            literature: {
                type: 'string',
                description: 'Literature',
                example: 'Wird in der Veranstaltung bekannt gegeben'
            },
            addInfo: {
                type: 'string',
                description: 'Additional information',
                example: 'Laptops erforderlich'
            },
            orgname: {
                type: 'string',
                description: 'Organizing unit',
                example: 'Lehrstuhl für Softwaretechnik'
            },
            chair: {
                type: 'string',
                description: 'Chair/department',
                example: 'Softwaretechnik'
            },
            type: {
                type: 'string',
                description: 'Course type',
                example: 'Praktikum'
            },
            semester: {
                type: 'string',
                description: 'Semester',
                example: '2024w'
            },
            ects: {
                type: 'number',
                format: 'float',
                example: 5.0
            },
            sws: {
                type: 'number',
                format: 'float',
                example: 4.0
            },
            keywords: {
                type: 'string',
                description: 'Keywords (semicolon-separated)',
                example: 'Software;Praktikum;Teamarbeit'
            },
            lang: {
                type: 'string',
                description: 'Language',
                example: 'de'
            },
            expAttendance: {
                type: 'number',
                format: 'float',
                description: 'Expected attendance',
                example: 30.0
            },
            format: {
                type: 'string',
                description: 'Course format',
                example: 'Präsenz'
            },
            nameEn: {
                type: 'string',
                description: 'English course name',
                example: 'Software Engineering Lab'
            },
            literatureEn: {
                type: 'string',
                description: 'English literature',
                example: 'To be announced'
            },
            organizationalEn: {
                type: 'string',
                description: 'English organizational info',
                example: 'Registration via FlexNow required'
            },
            descEn: {
                type: 'string',
                description: 'English description',
                example: 'Practical software development in teams'
            },
            lastUpdated: {
                type: 'string',
                format: 'date',
                description: 'Last update date',
                example: '2024-10-01'
            }
        }
    },

    Room: {
        type: 'object',
        description: 'University room',
        properties: {
            id: {
                type: 'string',
                description: 'Room ID',
                example: 'WE5/01.003'
            },
            short: {
                type: 'string',
                description: 'Short room identifier',
                example: '01.003'
            },
            address: {
                type: 'string',
                description: 'Building address',
                example: 'An der Weberei 5, 96047 Bamberg'
            },
            size: {
                type: 'number',
                format: 'float',
                description: 'Room capacity',
                example: 60.0
            }
        }
    },

    Term: {
        type: 'object',
        description: 'Course term/appointment',
        properties: {
            id: {
                type: 'integer',
                description: 'Term ID',
                example: 1
            },
            startdate: {
                type: 'string',
                description: 'Start date',
                example: '2024-10-14'
            },
            enddate: {
                type: 'string',
                description: 'End date',
                example: '2025-02-07'
            },
            starttime: {
                type: 'string',
                description: 'Start time',
                example: '10:00'
            },
            endtime: {
                type: 'string',
                description: 'End time',
                example: '12:00'
            },
            repeat: {
                type: 'string',
                description: 'Repeat pattern',
                example: 'weekly'
            },
            exclude: {
                type: 'string',
                description: 'Excluded dates',
                example: '2024-12-24,2024-12-31'
            },
            roomId: {
                type: 'string',
                description: 'Room ID',
                example: 'WE5/01.003'
            },
            courseId: {
                type: 'string',
                description: 'Course ID',
                example: 'C_2024w_001'
            },
            semester: {
                type: 'string',
                example: '2024w'
            }
        }
    },

    AcademicDate: {
        type: 'object',
        description: 'Important academic dates',
        properties: {
            id: {
                type: 'integer',
                example: 1
            },
            desc: {
                type: 'string',
                description: 'Date description',
                example: 'Vorlesungsbeginn'
            },
            startdate: {
                type: 'string',
                format: 'date',
                example: '2024-10-14'
            },
            enddate: {
                type: 'string',
                format: 'date',
                example: '2024-10-14'
            },
            starttime: {
                type: 'string',
                example: '08:00'
            },
            endtime: {
                type: 'string',
                example: '18:00'
            },
            typeId: {
                type: 'integer',
                description: 'Date type ID',
                example: 1
            },
            semester: {
                type: 'string',
                example: '2024w'
            }
        }
    },

    DateType: {
        type: 'object',
        description: 'Academic date type',
        properties: {
            typeId: {
                type: 'integer',
                example: 1
            },
            name: {
                type: 'string',
                description: 'Type name',
                example: 'Vorlesungszeit'
            },
            desc: {
                type: 'string',
                description: 'Type description',
                example: 'Reguläre Vorlesungszeiten'
            }
        }
    },

    // ==========================================
    // Mongoose Schemas
    // ==========================================

    User: {
        type: 'object',
        description: 'User account',
        properties: {
            _id: {
                type: 'string',
                description: 'MongoDB ObjectId',
                example: '507f1f77bcf86cd799439011'
            },
            shibId: {
                type: 'string',
                description: 'Shibboleth ID (32 characters)',
                minLength: 32,
                maxLength: 32,
                example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
            },
            roles: {
                type: 'array',
                description: 'User roles',
                items: {
                    type: 'string',
                    enum: ['admin', 'student', 'employee', 'staff', 'member', 'faculty', 'demo', 'advisor']
                },
                example: ['student']
            },
            authType: {
                type: 'string',
                description: 'Authentication type',
                enum: ['local', 'saml'],
                example: 'saml'
            },
            completedModules: {
                type: 'array',
                description: 'Completed modules',
                items: {
                    $ref: '#/components/schemas/CompletedModule'
                }
            },
            startSemester: {
                type: 'string',
                description: 'Start semester',
                pattern: '\\d{4}((w)|(s))',
                example: '2022w'
            },
            duration: {
                type: 'integer',
                description: 'Study duration in semesters',
                minimum: 3,
                maximum: 20,
                example: 6
            },
            maxEcts: {
                type: 'integer',
                description: 'Maximum ECTS per semester',
                minimum: 1,
                maximum: 300,
                example: 30
            },
            sps: {
                type: 'array',
                description: 'Study programmes',
                items: {
                    $ref: '#/components/schemas/UserStudyProgramme'
                }
            },
            fulltime: {
                type: 'boolean',
                description: 'Full-time student',
                example: true
            },
            dashboardSettings: {
                type: 'array',
                description: 'Dashboard widget visibility',
                items: {
                    type: 'object',
                    properties: {
                        key: { type: 'string', example: 'recommendations' },
                        visible: { type: 'boolean', example: true }
                    }
                }
            },
            timetableSettings: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        showWeekends: { type: 'boolean', example: false }
                    }
                }
            },
            favouriteModulesAcronyms: {
                type: 'array',
                description: 'Favourite module acronyms',
                items: {
                    type: 'string'
                },
                example: ['SE1', 'DB1', 'AI1']
            },
            excludedModulesAcronyms: {
                type: 'array',
                description: 'Excluded module acronyms',
                items: {
                    type: 'string'
                },
                example: ['HCI1']
            },
            hints: {
                type: 'array',
                description: 'UI hints/tips status',
                items: {
                    type: 'object',
                    properties: {
                        key: { type: 'string', example: 'welcome_tour' },
                        hasConfirmed: { type: 'boolean', example: true }
                    }
                }
            },
            consents: {
                type: 'array',
                description: 'User consents',
                items: {
                    type: 'object',
                    properties: {
                        ctype: { type: 'string', example: 'privacy_policy' },
                        hasConfirmed: { type: 'boolean', example: true },
                        hasResponded: { type: 'boolean', example: true },
                        timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' }
                    }
                }
            },
            topics: {
                type: 'array',
                description: 'Topic IDs',
                items: {
                    type: 'string'
                },
                example: ['T_ML', 'T_WEB', 'T_DS']
            },
            jobs: {
                type: 'array',
                description: 'User job profiles',
                items: {
                    $ref: '#/components/schemas/UserJob'
                }
            },
            moduleFeedback: {
                type: 'array',
                description: 'Module feedback',
                items: {
                    type: 'object',
                    properties: {
                        acronym: { type: 'string', example: 'SE1' },
                        similarmods: { type: 'integer', minimum: 0, maximum: 5, example: 4 },
                        similarchair: { type: 'integer', minimum: 0, maximum: 5, example: 3 },
                        priorknowledge: { type: 'integer', minimum: 0, maximum: 5, example: 5 },
                        contentmatch: { type: 'integer', minimum: 0, maximum: 5, example: 4 }
                    }
                }
            },
            compAims: {
                type: 'array',
                description: 'Competence aims',
                items: {
                    type: 'object',
                    properties: {
                        compId: { type: 'string', example: 'COMP_001' },
                        aim: { type: 'integer', minimum: 0, maximum: 3, example: 2 },
                        standard: { type: 'string', example: 'CS2013' },
                        parent: { type: 'string', example: 'COMP_000' }
                    }
                }
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:00:00Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-11-05T14:30:00Z'
            }
        }
    },

    CompletedModule: {
        type: 'object',
        description: 'Completed module entry',
        properties: {
            mgId: {
                type: 'string',
                description: 'Module group ID',
                example: 'MG_001'
            },
            acronym: {
                type: 'string',
                example: 'SE1'
            },
            name: {
                type: 'string',
                example: 'Software Engineering 1'
            },
            ects: {
                type: 'number',
                example: 5.0
            },
            grade: {
                type: 'number',
                description: 'Grade (1.0-5.0)',
                example: 1.7
            },
            status: {
                type: 'string',
                enum: ['taken', 'failed', 'passed', 'open'],
                example: 'passed'
            },
            semester: {
                type: 'string',
                pattern: '\\d{4}((w)|(s))',
                example: '2023w'
            },
            notes: {
                type: 'string',
                maxLength: 1000,
                example: 'Interessantes Modul, sehr praxisnah'
            },
            isUserGenerated: {
                type: 'boolean',
                example: false
            },
            flexNowImported: {
                type: 'boolean',
                description: 'Imported from FlexNow',
                example: true
            }
        }
    },

    UserStudyProgramme: {
        type: 'object',
        description: 'User study programme reference',
        properties: {
            spId: {
                type: 'string',
                example: 'BAAng'
            },
            poVersion: {
                type: 'integer',
                example: 4
            },
            name: {
                type: 'string',
                example: 'Bachelorstudiengang Angewandte Informatik'
            },
            faculty: {
                type: 'string',
                example: 'WIAI'
            },
            mhbId: {
                type: 'string',
                example: 'MHB_BAAng_2020'
            },
            mhbVersion: {
                type: 'integer',
                example: 1
            }
        }
    },

    // UserJob: {
    //     type: 'object',
    //     description: 'User job profile (subdocument)',
    //     properties: {
    //         _id: {
    //             type: 'string',
    //             description: 'Subdocument ID',
    //             example: '507f1f77bcf86cd799439012'
    //         },
    //         title: {
    //             type: 'string',
    //             maxLength: 1000,
    //             example: 'Full-Stack Developer'
    //         },
    //         description: {
    //             type: 'string',
    //             maxLength: 2000,
    //             example: 'Entwicklung von Web-Anwendungen mit React und Node.js'
    //         },
    //         keywords: {
    //             type: 'array',
    //             items: {
    //                 type: 'string'
    //             },
    //             example: ['JavaScript', 'React', 'Node.js', 'MongoDB']
    //         },
    //         inputMode: {
    //             type: 'string',
    //             enum: ['url', 'mock'],
    //             example: 'mock'
    //         },
    //         embeddingId: {
    //             type: 'string',
    //             description: 'Associated embedding ID',
    //             example: 'EMB_001'
    //         },
    //         createdAt: {
    //             type: 'string',
    //             format: 'date-time'
    //         },
    //         updatedAt: {
    //             type: 'string',
    //             format: 'date-time'
    //         }
    //     }
    // },

    Job: {
        type: 'object',
        description: 'Job profile (complete with user reference)',
        properties: {
            _id: {
                type: 'string',
                example: '507f1f77bcf86cd799439012'
            },
            title: {
                type: 'string',
                example: 'Full-Stack Developer'
            },
            description: {
                type: 'string',
                example: 'Entwicklung von Web-Anwendungen mit React und Node.js'
            },
            keywords: {
                type: 'array',
                items: {
                    type: 'string'
                },
                example: ['JavaScript', 'React', 'Node.js', 'MongoDB']
            },
            inputMode: {
                type: 'string',
                enum: ['url', 'mock'],
                example: 'mock'
            },
            embeddingId: {
                type: 'string',
                example: 'EMB_001'
            },
            userId: {
                type: 'string',
                description: 'Owner user ID',
                example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-10-01T10:00:00Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-10-05T14:30:00Z'
            }
        }
    },

    // Jobtemplate: {
    //     type: 'object',
    //     description: 'Job creation template',
    //     required: ['title', 'inputMode', 'keywords'],
    //     properties: {
    //         title: {
    //             type: 'string',
    //             example: 'Full-Stack Developer'
    //         },
    //         description: {
    //             type: 'string',
    //             example: 'Entwicklung von Web-Anwendungen'
    //         },
    //         inputMode: {
    //             type: 'string',
    //             enum: ['url', 'mock'],
    //             example: 'mock'
    //         },
    //         keywords: {
    //             type: 'array',
    //             items: {
    //                 type: 'string'
    //             },
    //             example: ['JavaScript', 'React', 'Node.js']
    //         }
    //     }
    // },

    ExtendedJob: {
        type: 'object',
        description: 'Job with recommendations',
        allOf: [
            { $ref: '#/components/schemas/Job' },
            {
                type: 'object',
                properties: {
                    recModules: {
                        type: 'array',
                        description: 'Recommended modules',
                        items: {
                            $ref: '#/components/schemas/RecommendedModule'
                        }
                    },
                    loading: {
                        type: 'boolean',
                        example: false
                    }
                }
            }
        ]
    },

    StudyPlan: {
        type: 'object',
        description: 'User study plan',
        properties: {
            _id: {
                type: 'string',
                example: '507f1f77bcf86cd799439013'
            },
            name: {
                type: 'string',
                example: 'Mein Studienplan WS 2024'
            },
            status: {
                type: 'boolean',
                description: 'Active status',
                example: true
            },
            semesterPlans: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SemesterPlan'
                }
            },
            userId: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-09-01T10:00:00Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-11-05T14:30:00Z'
            }
        }
    },

    SemesterPlan: {
        type: 'object',
        description: 'Semester plan',
        properties: {
            semester: {
                type: 'string',
                description: 'Semester identifier',
                pattern: '\\d{4}((w)|(s))',
                example: '2024w'
            },
            isPastSemester: {
                type: 'boolean',
                description: 'Is this a past semester',
                example: false
            },
            modules: {
                type: 'array',
                description: 'Module acronyms',
                items: {
                    type: 'string'
                },
                example: ['SE1', 'DB1', 'AI1']
            },
            userGeneratedModules: {
                type: 'array',
                description: 'Custom modules',
                items: {
                    $ref: '#/components/schemas/UserGeneratedModule'
                }
            },
            courses: {
                type: 'array',
                description: 'Selected courses',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'C_2024w_001' },
                        name: { type: 'string', example: 'Software Engineering Praktikum' },
                        status: { type: 'string', example: 'enrolled' },
                        ects: { type: 'number', example: 5.0 },
                        sws: { type: 'number', example: 4.0 },
                        contributeTo: { type: 'string', example: 'M_SE1' },
                        contributeAs: { type: 'string', example: 'Praktikum' }
                    }
                }
            },
            aimedEcts: {
                type: 'number',
                description: 'Target ECTS for semester',
                minimum: 0,
                maximum: 210,
                example: 30.0
            },
            summedEcts: {
                type: 'number',
                description: 'Actual summed ECTS',
                minimum: 0,
                maximum: 210,
                example: 28.0
            },
            expanded: {
                type: 'boolean',
                description: 'UI expansion state',
                example: true
            },
            userId: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
            }
        }
    },

    UserGeneratedModule: {
        type: 'object',
        description: 'User-created module',
        properties: {
            name: {
                type: 'string',
                maxLength: 1000,
                example: 'Externes Praktikum'
            },
            acronym: {
                type: 'string',
                maxLength: 100,
                example: 'EXT_PRAK'
            },
            ects: {
                type: 'number',
                minimum: 0,
                maximum: 30,
                example: 10.0
            },
            notes: {
                type: 'string',
                maxLength: 1000,
                example: 'Praktikum bei Firma XY'
            },
            status: {
                type: 'string',
                enum: ['taken', 'failed', 'passed', 'open'],
                example: 'open'
            },
            flexNowImported: {
                type: 'boolean',
                example: false
            }
        }
    },

    Recommendation: {
        type: 'object',
        description: 'Module recommendations',
        properties: {
            _id: {
                type: 'string',
                example: '507f1f77bcf86cd799439014'
            },
            recommendedMods: {
                type: 'array',
                description: 'Ranked list of recommended modules',
                items: {
                    $ref: '#/components/schemas/RecommendedModule'
                }
            },
            userId: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-11-01T10:00:00Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-11-05T14:30:00Z'
            }
        }
    },

    RecommendedModule: {
        type: 'object',
        description: 'Recommended module with sources',
        properties: {
            acronym: {
                type: 'string',
                maxLength: 100,
                example: 'ML1'
            },
            source: {
                type: 'array',
                description: 'Recommendation sources',
                items: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['job', 'topic', 'interest', 'cohort', 'feedback_similarmods'],
                            example: 'job'
                        },
                        identifier: {
                            type: 'string',
                            description: 'Source identifier (e.g., job ID)',
                            example: '507f1f77bcf86cd799439012'
                        },
                        score: {
                            type: 'number',
                            description: 'Similarity score',
                            minimum: 0,
                            maximum: 1,
                            example: 0.85
                        }
                    }
                }
            },
            weight: {
                type: 'number',
                description: 'Overall weight/importance',
                minimum: 0,
                maximum: 10,
                example: 7.5
            },
            position: {
                type: 'integer',
                description: 'Position in ranking',
                minimum: 0,
                maximum: 100,
                example: 3
            }
        }
    },

    Topic: {
        type: 'object',
        description: 'Topic/interest area',
        properties: {
            tId: {
                type: 'string',
                description: 'Topic ID',
                example: 'T_ML'
            },
            name: {
                type: 'string',
                maxLength: 100,
                example: 'Machine Learning'
            },
            keywords: {
                type: 'array',
                items: {
                    type: 'string'
                },
                example: ['neural networks', 'deep learning', 'supervised learning']
            },
            description: {
                type: 'string',
                example: 'Machine learning algorithms and applications'
            },
            parentId: {
                type: 'string',
                description: 'Parent topic ID',
                example: 'T_AI'
            },
            embeddingId: {
                type: 'string',
                description: 'Associated embedding ID',
                example: 'EMB_T_ML'
            },
            createdAt: {
                type: 'string',
                format: 'date-time'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    Embedding: {
        type: 'object',
        description: 'Vector embedding (non-module)',
        properties: {
            _id: {
                type: 'string',
                example: 'EMB_001'
            },
            identifier: {
                type: 'string',
                description: 'Identifier (e.g., job ID, topic ID)',
                example: '507f1f77bcf86cd799439012'
            },
            vector: {
                type: 'array',
                description: 'Embedding vector',
                items: {
                    type: 'number',
                    format: 'float',
                    minimum: -1.0,
                    maximum: 1.0
                },
                example: [0.123, -0.456, 0.789, 0.012]
            },
            createdAt: {
                type: 'string',
                format: 'date-time'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    ModEmbedding: {
        type: 'object',
        description: 'Module embedding',
        properties: {
            _id: {
                type: 'string',
                example: 'MEMB_SE1'
            },
            acronym: {
                type: 'string',
                description: 'Module acronym',
                example: 'SE1'
            },
            vector: {
                type: 'array',
                description: 'Embedding vector',
                items: {
                    type: 'number',
                    format: 'float',
                    minimum: -1.0,
                    maximum: 1.0
                },
                example: [0.234, -0.567, 0.890, 0.123]
            },
            createdAt: {
                type: 'string',
                format: 'date-time'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time'
            }
        }
    },

    // Evaluation: {
    //     type: 'object',
    //     description: 'Job-based module evaluation',
    //     properties: {
    //         _id: {
    //             type: 'string',
    //             example: '507f1f77bcf86cd799439015'
    //         },
    //         spId: {
    //             type: 'string',
    //             description: 'Study plan ID',
    //             example: '507f1f77bcf86cd799439013'
    //         },
    //         jobEvaluations: {
    //             type: 'array',
    //             items: {
    //                 type: 'object',
    //                 properties: {
    //                     job: {
    //                         type: 'object',
    //                         properties: {
    //                             jobId: { type: 'string', example: '507f1f77bcf86cd799439012' }
    //                         }
    //                     },
    //                     candidates: {
    //                         type: 'array',
    //                         description: 'Candidate modules',
    //                         items: {
    //                             type: 'object',
    //                             properties: {
    //                                 acronym: { type: 'string', example: 'ML1' }
    //                             }
    //                         }
    //                     },
    //                     rankedModules: {
    //                         type: 'array',
    //                         description: 'Ranked module list',
    //                         items: {
    //                             type: 'object',
    //                             properties: {
    //                                 acronym: { type: 'string', example: 'ML1' },
    //                                 ranking: { type: 'integer', minimum: 0, maximum: 100, example: 95 }
    //                             }
    //                         }
    //                     },
    //                     comment: {
    //                         type: 'string',
    //                         example: 'Good match for job profile'
    //                     },
    //                     createdAt: {
    //                         type: 'string',
    //                         format: 'date-time'
    //                     },
    //                     updatedAt: {
    //                         type: 'string',
    //                         format: 'date-time'
    //                     }
    //                 }
    //             }
    //         },
    //         createdAt: {
    //             type: 'string',
    //             format: 'date-time',
    //             example: '2024-11-01T10:00:00Z'
    //         },
    //         updatedAt: {
    //             type: 'string',
    //             format: 'date-time',
    //             example: '2024-11-05T14:30:00Z'
    //         }
    //     }
    // },

    // LongTermEvaluation: {
    //     type: 'object',
    //     description: 'Long-term user evaluation/survey',
    //     properties: {
    //         _id: {
    //             type: 'string',
    //             example: '507f1f77bcf86cd799439016'
    //         },
    //         personalCode: {
    //             type: 'string',
    //             description: 'Personal evaluation code',
    //             example: 'EVAL_ABC123'
    //         },
    //         evaluationCode: {
    //             type: 'string',
    //             description: 'Evaluation identifier',
    //             example: 'LONGTERM_2024W'
    //         },
    //         spName: {
    //             type: 'string',
    //             description: 'Study programme name',
    //             example: 'Angewandte Informatik'
    //         },
    //         semester: {
    //             type: 'integer',
    //             description: 'Current semester',
    //             minimum: 0,
    //             maximum: 20,
    //             example: 5
    //         },
    //         pu: {
    //             type: 'array',
    //             description: 'Perceived Usefulness (4 items, 0-7)',
    //             items: {
    //                 type: 'integer',
    //                 minimum: 0,
    //                 maximum: 7
    //             },
    //             minItems: 4,
    //             maxItems: 4,
    //             example: [6, 5, 7, 6]
    //         },
    //         peou: {
    //             type: 'array',
    //             description: 'Perceived Ease of Use (4 items, 0-7)',
    //             items: {
    //                 type: 'integer',
    //                 minimum: 0,
    //                 maximum: 7
    //             },
    //             minItems: 4,
    //             maxItems: 4,
    //             example: [6, 6, 5, 7]
    //         },
    //         bi: {
    //             type: 'integer',
    //             description: 'Behavioral Intention (0-7)',
    //             minimum: 0,
    //             maximum: 7,
    //             example: 6
    //         },
    //         use: {
    //             type: 'string',
    //             description: 'Usage frequency',
    //             enum: ['täglich', 'mehrmals pro Woche', 'einmal pro Woche', 'seltener', 'undefined'],
    //             example: 'mehrmals pro Woche'
    //         },
    //         nps: {
    //             type: 'integer',
    //             description: 'Net Promoter Score (0-10)',
    //             minimum: 0,
    //             maximum: 10,
    //             example: 8
    //         },
    //         feedback: {
    //             type: 'string',
    //             description: 'Free text feedback',
    //             maxLength: 1000,
    //             example: 'Die Empfehlungen waren sehr hilfreich bei der Studienplanung.'
    //         },
    //         createdAt: {
    //             type: 'string',
    //             format: 'date-time',
    //             example: '2024-11-05T10:00:00Z'
    //         },
    //         updatedAt: {
    //             type: 'string',
    //             format: 'date-time',
    //             example: '2024-11-05T10:00:00Z'
    //         }
    //     }
    // }
}

export const swaggerBilAppSchema = {
    ...swaggerSchemas,
    Standard: {
        type: 'object',
        description: 'Competence standard',
        properties: {
            stId: {
                type: 'string',
                description: 'Standard ID',
                example: 'ST_001'
            },
            desc: {
                type: 'string',
                description: 'Standard description',
                example: 'IEEE Computer Science Curricula'
            },
            name: {
                type: 'string',
                description: 'Standard name',
                example: 'CS2013'
            }
        }
    },

    Competence: {
        type: 'object',
        description: 'Competence/skill',
        properties: {
            compId: {
                type: 'string',
                description: 'Competence ID',
                example: 'COMP_001'
            },
            short: {
                type: 'string',
                description: 'Short identifier',
                example: 'SE.Design'
            },
            name: {
                type: 'string',
                description: 'Competence name',
                example: 'Software Design'
            },
            desc: {
                type: 'string',
                description: 'Competence description',
                example: 'Ability to design software architectures and components'
            },
            stId: {
                type: 'string',
                description: 'Associated standard ID',
                example: 'ST_001'
            },
            parentId: {
                type: 'string',
                description: 'Parent competence ID',
                example: 'COMP_000'
            }
        }
    },

    CompetenceCourse: {
        type: 'object',
        description: 'Course-Competence relationship',
        properties: {
            cId: {
                type: 'string',
                description: 'Course ID',
                example: 'C_2024w_001'
            },
            semester: {
                type: 'string',
                example: '2024w'
            },
            compId: {
                type: 'string',
                description: 'Competence ID',
                example: 'COMP_001'
            },
            fulfillment: {
                type: 'integer',
                description: 'Fulfillment level (0-3)',
                example: 2
            }
        }
    },
}