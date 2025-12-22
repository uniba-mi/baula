/**
 * Centralized Swagger schema definitions
 */
const swaggerSchemas = {

    // ==========================================
    // Shared Schemas
    // ==========================================

    BadRequestError: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'The request was invalid or malformed.'
            },
            code: {
                type: 'string',
                example: 'BAD_REQUEST'
            }
        },
        required: ['message']
    },

    UnauthorizedError: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'Unauthorized'
            },
            code: {
                type: 'string',
                example: 'UNAUTHORIZED'
            }
        },
        required: ['message']
    },

    NotFoundError: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'The requested resource could not be found.'
            },
            code: {
                type: 'string',
                example: 'NOT_FOUND'
            }
        },
        required: ['message']
    },

    InternalServerError: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'An internal server error occurred.'
            },
            code: {
                type: 'string',
                example: 'INTERNAL_SERVER_ERROR'
            }
        },
        required: ['message']
    }
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
                description: 'Short department identifier',
                example: 'DEP'
            },
            name: {
                type: 'string',
                description: 'Full department name',
                example: 'Department of X'
            }
        }
    },

    StudyProgramme: {
        type: 'object',
        properties: {
            spId: {
                type: 'string',
                description: 'Study programme ID',
                example: 'SP1'
            },
            poVersion: {
                type: 'integer',
                description: 'PO (Prüfungsordnung) version number',
                example: 1
            },
            name: {
                type: 'string',
                description: 'Programme name',
                example: 'Bachelor Programme of X'
            },
            desc: {
                type: 'string',
                description: 'Programme description',
                example: 'Longer programme description (StuFPO)'
            },
            date: {
                type: 'string',
                description: 'Programme date (StuFPO)',
                example: '30.09.2023'
            },
            faculty: {
                type: 'string',
                description: 'Faculty short name',
                example: 'FAC1'
            },
            dep: {
                $ref: '#/components/schemas/Department'
            },
            mhbs: {
                type: 'array',
                description: 'Module handbooks',
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
                example: 'MHB1'
            },
            name: {
                type: 'string',
                description: 'Handbook name',
                example: 'Module handbook applied X'
            },
            desc: {
                type: 'string',
                description: 'Handbook description',
                example: 'Module handbook of programme applied X'
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
                description: 'Study programme ID',
                example: 'SP1'
            },
            poVersion: {
                type: 'integer',
                description: 'PO version',
                example: 1
            }
        }
    },

    ModuleGroup: {
        type: 'object',
        description: 'Module group',
        properties: {
            mgId: {
                type: 'string',
                description: 'Module group ID',
                example: 'MG1'
            },
            version: {
                type: 'integer',
                example: 1
            },
            name: {
                type: 'string',
                description: 'Module group name',
                example: 'Compulsory modules'
            },
            fullName: {
                type: 'string',
                description: 'Full module group name',
                example: 'Compulsory modules of X'
            },
            desc: {
                type: 'string',
                description: 'Module group description',
                example: 'Compulsory modules for programme X'
            },
            ectsMin: {
                type: 'number',
                format: 'float',
                description: 'Minimum ECTS credits required',
                example: 30
            },
            ectsMax: {
                type: 'number',
                format: 'float',
                description: 'Maximum ECTS credits',
                example: 60
            },
            order: {
                type: 'number',
                format: 'float',
                description: 'Display order',
                example: 1
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
                example: 'M1'
            },
            version: {
                type: 'integer',
                example: 1
            },
            acronym: {
                type: 'string',
                description: 'Module acronym',
                example: 'MOD-A'
            },
            name: {
                type: 'string',
                description: 'Module name',
                example: 'Applied X'
            },
            content: {
                type: 'string',
                description: 'Module content description',
                example: 'Introduction into Applied X contains...'
            },
            skills: {
                type: 'string',
                description: 'Learning goals description',
                example: 'Students learn to...'
            },
            addInfo: {
                type: 'string',
                description: 'Additional information',
                example: 'Applied X takes place in ...'
            },
            priorKnowledge: {
                type: 'string',
                description: 'Required prior knowledge',
                example: 'Basics in Y'
            },
            ects: {
                type: 'number',
                format: 'float',
                description: 'ECTS credits',
                example: 5
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
                description: 'Module duration (semester)',
                example: '1'
            },
            chair: {
                type: 'string',
                description: 'Responsible chair/department',
                example: 'Chair of Y'
            },
            offerBegin: {
                type: 'string',
                description: 'Start of offering period',
                // example: 'TODO'
            },
            offerEnd: {
                type: 'string',
                description: 'End of offering period',
                // example: 'TODO'
            },
            workload: {
                type: 'string',
                description: 'Workload breakdown',
                // example: 'TODO'
            },
            prevModules: {
                type: 'object',
                description: 'Previous modules (JSON)',
                example: {}
            },
            respPersonId: {
                type: 'string',
                description: 'Responsible person ID',
                example: 'P1'
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
                example: 'Exam'
            },
            name: {
                type: 'string',
                description: 'Full exam name',
                example: 'Written Exam'
            },
            desc: {
                type: 'string',
                description: 'Exam description',
                example: '90 minutes exam'
            },
            duration: {
                type: 'number',
                format: 'float',
                description: 'Exam duration in minutes',
                example: 90
            },
            share: {
                type: 'string',
                description: 'Share of final grade',
                example: '100%'
            },
            mId: {
                type: 'string',
                description: 'Associated module ID',
                example: 'M1'
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
                example: 'MC1'
            },
            name: {
                type: 'string',
                description: 'Course name',
                example: 'Applied X 1 - Lecture'
            },
            identifier: {
                type: 'object',
                description: 'Additional identifiers',
                example: {}
            },
            type: {
                type: 'string',
                description: 'Course type',
                example: 'Lecture'
            },
            language: {
                type: 'string',
                description: 'Course language',
                example: 'English'
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
                example: 1
            },
            compulsory: {
                type: 'boolean',
                description: 'Is compulsory',
                example: true
            },
            desc: {
                type: 'string',
                description: 'Course description',
                example: 'Lecture on the basics of X'
            },
            literature: {
                type: 'string',
                description: 'Recommended literature',
                example: 'Author: Book title'
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
                example: 'P1'
            },
            title: {
                type: 'string',
                description: 'Academic title',
                example: 'Prof.'
            },
            firstname: {
                type: 'string',
                example: 'John'
            },
            lastname: {
                type: 'string',
                example: 'Doe'
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@XXX.de'
            },
            tel: {
                type: 'string',
                description: 'Telephone number',
                example: '+11 111 111-1111'
            },
            office: {
                type: 'string',
                description: 'Office location',
                example: 'FAC/1.2'
            }
        }
    },

    Course: {
        type: 'object',
        description: 'Course (Lecture from UnivIS)',
        properties: {
            id: {
                type: 'string',
                description: 'Course ID',
                example: 'C1'
            },
            name: {
                type: 'string',
                description: 'Course name',
                example: 'MOD-A: Applied X'
            },
            short: {
                type: 'string',
                description: 'Short name',
                example: 'Applied X'
            },
            organizational: {
                type: 'string',
                description: 'Organizational information',
                example: 'Please write an e-mail beforehand'
            },
            desc: {
                type: 'string',
                description: 'Course description',
                example: 'Applying Y to X'
            },
            literature: {
                type: 'string',
                description: 'Literature',
                example: 'Author: Book title'
            },
            addInfo: {
                type: 'string',
                description: 'Additional information',
                example: 'Bring tablets.'
            },
            orgname: {
                type: 'string',
                description: 'Organizing unit',
                example: 'Chair of X'
            },
            chair: {
                type: 'string',
                description: 'Chair/department',
                example: 'X'
            },
            type: {
                type: 'string',
                description: 'Course type',
                example: 'Seminar'
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
                example: 'Teamwork;Practise'
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
                example: 'Remote'
            },
            nameEn: {
                type: 'string',
                description: 'English course name',
                example: 'Applied course of X'
            },
            literatureEn: {
                type: 'string',
                description: 'English literature',
                example: 'Author: Book title'
            },
            organizationalEn: {
                type: 'string',
                description: 'Please write an e-mail beforehand',
                example: ''
            },
            descEn: {
                type: 'string',
                description: 'English description',
                example: 'Applying Y to X'
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
                example: 'DEP/1.2'
            },
            short: {
                type: 'string',
                description: 'Short room identifier',
                example: '1.2'
            },
            address: {
                type: 'string',
                description: 'Building address',
                example: 'Summerstreet 1'
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
                example: 'DEP/1.2'
            },
            courseId: {
                type: 'string',
                description: 'Course ID',
                example: 'C1'
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
                example: 'Holidays'
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
                example: 'Holidays'
            },
            desc: {
                type: 'string',
                description: 'Type description',
                example: 'Time without lectures'
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
                example: '<MONGO_ID>'
            },
            shibId: {
                type: 'string',
                description: 'Shibboleth ID',
                // minLength: 32,
                // maxLength: 32,
                example: '<SHIB-ID>'
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
                example: '2024w'
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
                    $ref: '#/components/schemas/DashboardSetting'
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
                example: ['MOD-A', 'MOD-B']
            },
            excludedModulesAcronyms: {
                type: 'array',
                description: 'Excluded module acronyms',
                items: {
                    type: 'string'
                },
                example: ['MODC']
            },
            hints: {
                type: 'array',
                description: 'UI hints/tips status',
                items: {
                    $ref: '#/components/schemas/Hint'
                }
            },
            consents: {
                type: 'array',
                description: 'User consents',
                items: {
                    $ref: '#/components/schemas/Consent'
                }
            },
            topics: {
                type: 'array',
                description: 'Topic IDs',
                items: {
                    type: 'string'
                },
                example: ['<MONGO_ID>', '<MONGO_ID>', '<MONGO_ID>']
            },
            jobs: {
                type: 'array',
                description: 'User job profiles',
                items: {
                    $ref: '#/components/schemas/Job'
                }
            },
            moduleFeedback: {
                type: 'array',
                description: 'Module feedback',
                items: {
                    $ref: '#/components/schemas/ModuleFeedback'
                }
            },
            compAims: {
                type: 'array',
                description: 'Competence aims',
                items: {
                    $ref: '#/components/schemas/CompetenceAim'
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
                example: 'MG1'
            },
            acronym: {
                type: 'string',
                example: 'MOD-A'
            },
            name: {
                type: 'string',
                example: 'Applied X'
            },
            ects: {
                type: 'number',
                example: 5
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
                example: '2024w'
            },
            notes: {
                type: 'string',
                maxLength: 1000,
                example: 'Nice module, interesting for me...'
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
                example: 'SP1'
            },
            poVersion: {
                type: 'integer',
                example: 1
            },
            name: {
                type: 'string',
                example: 'Bachelor Applied X'
            },
            faculty: {
                type: 'string',
                example: 'FAC1'
            },
            mhbId: {
                type: 'string',
                example: 'MHB1'
            },
            mhbVersion: {
                type: 'integer',
                example: 1
            }
        }
    },

    Job: {
        type: 'object',
        description: 'Job profile',
        properties: {
            _id: {
                type: 'string',
                example: '<MONGO_ID>'
            },
            title: {
                type: 'string',
                example: 'Full-Stack Developer'
            },
            description: {
                type: 'string',
                example: 'Developing Websites with...'
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
                example: 'E1'
            },
            userId: {
                type: 'string',
                description: 'Owner user ID',
                example: '<MONGO_ID>'
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
                example: '<MONGO_ID>'
            },
            name: {
                type: 'string',
                example: 'My studyplan'
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
                example: '<MONGO_ID>'
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

    SemesterPlanCourse: {
        type: 'object',
        properties: {
            id: { type: 'string', example: 'C1' },
            name: { type: 'string', example: 'Applied X' },
            status: { type: 'string', example: 'open' },
            ects: { type: 'number', example: 5.0 },
            sws: { type: 'number', example: 4.0 },
            contributeTo: { type: 'string', example: 'MC1' },
            contributeAs: { type: 'string', example: 'Seminar' }
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
                example: true
            },
            modules: {
                type: 'array',
                description: 'Module acronyms',
                items: {
                    type: 'string'
                },
                example: ['MOD-A', 'MOD-B']
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
                    $ref: '#/components/schemas/SemesterPlanCourse'
                }
            },
            aimedEcts: {
                type: 'number',
                description: 'Target ECTS for semester',
                minimum: 0,
                maximum: 210,
                example: 30
            },
            summedEcts: {
                type: 'number',
                description: 'Actual summed ECTS',
                minimum: 0,
                maximum: 210,
                example: 28
            },
            expanded: {
                type: 'boolean',
                description: 'UI expansion state',
                example: true
            },
            userId: {
                type: 'string',
                example: '<MONGO_ID>'
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
                example: 'internship'
            },
            acronym: {
                type: 'string',
                maxLength: 100,
                example: 'INT'
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
                example: 'Internship for SAP'
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

    TransferResult: {
        type: 'object',
        description: 'Result of module transfer between semesters',
        properties: {
            oldSemesterPlan: {
                $ref: '#/components/schemas/SemesterPlan'
            },
            newSemesterPlan: {
                $ref: '#/components/schemas/SemesterPlan'
            }
        }
    },

    Recommendation: {
        type: 'object',
        description: 'Module recommendations',
        properties: {
            _id: {
                type: 'string',
                example: '<MONGO_ID>'
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
                example: '<MONGO_ID>'
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
                example: 'MOD-A'
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
                            example: '<MONGO_ID>'
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
                example: 'T10'
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
                example: 'T1'
            },
            embeddingId: {
                type: 'string',
                description: 'Associated embedding ID',
                example: 'E1'
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
                example: 'E1'
            },
            identifier: {
                type: 'string',
                description: 'Identifier (e.g., job ID, topic ID)',
                example: '<MONGO_ID>'
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
                example: 'ME1'
            },
            acronym: {
                type: 'string',
                description: 'Module acronym',
                example: 'MOD-A'
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

        ModuleFeedback: {
        type: 'object',
        properties: {
            acronym: { type: 'string', example: 'MOD-A' },
            similarmods: { type: 'integer', minimum: 0, maximum: 5, example: 4 },
            similarchair: { type: 'integer', minimum: 0, maximum: 5, example: 3 },
            priorknowledge: { type: 'integer', minimum: 0, maximum: 5, example: 5 },
            contentmatch: { type: 'integer', minimum: 0, maximum: 5, example: 4 }
        }
    },

    Consent: {
        type: 'object',
        description: 'User consent entry',
        properties: {
            ctype: { type: 'string', example: 'privacy-policy' },
            hasConfirmed: { type: 'boolean', example: true },
            hasResponded: { type: 'boolean', example: true },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' }
        }
    },

    Hint: {
        type: 'object',
        description: 'UI hint status',
        properties: {
            key: { type: 'string', example: 'module-hint' },
            hasConfirmed: { type: 'boolean', example: true }
        }
    },

    DashboardSetting: {
        type: 'object',
        description: 'Dashboard widget visibility setting',
        properties: {
            key: { type: 'string', example: 'gpa' },
            visible: { type: 'boolean', example: true }
        }
    },

    CompetenceAim: {
        type: 'object',
        description: 'User competence goal',
        properties: {
            compId: { type: 'string', example: 'C10' },
            aim: { type: 'integer', minimum: 0, maximum: 3, example: 2 },
            standard: { type: 'string', example: 'S1' },
            parent: { type: 'string', example: 'C1' }
        }
    },
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
                example: 'ST1'
            },
            desc: {
                type: 'string',
                description: 'Standard description',
                example: 'IEEE Computer Science Curricula'
            },
            name: {
                type: 'string',
                description: 'Standard name',
                example: 'Standard XY'
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
                example: 'C10'
            },
            short: {
                type: 'string',
                description: 'Short identifier',
                example: 'C10.X'
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
                example: 'ST1'
            },
            parentId: {
                type: 'string',
                description: 'Parent competence ID',
                example: 'C1'
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
                example: 'C1'
            },
            semester: {
                type: 'string',
                example: '2024w'
            },
            compId: {
                type: 'string',
                description: 'Competence ID',
                example: 'C10'
            },
            fulfillment: {
                type: 'integer',
                description: 'Fulfillment level (0-3)',
                example: 1
            }
        }
    },
}