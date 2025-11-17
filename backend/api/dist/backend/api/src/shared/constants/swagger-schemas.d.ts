export declare const swaggerBaulaSchema: {
    Department: {
        type: string;
        properties: {
            shortName: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    StudyProgramme: {
        type: string;
        properties: {
            spId: {
                type: string;
                description: string;
                example: string;
            };
            poVersion: {
                type: string;
                description: string;
                example: number;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            date: {
                type: string;
                description: string;
                example: string;
            };
            faculty: {
                type: string;
                description: string;
                example: string;
            };
            dep: {
                $ref: string;
            };
            mhbs: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
    ModuleHandbook: {
        type: string;
        description: string;
        properties: {
            mhbId: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            version: {
                type: string;
                description: string;
                example: number;
            };
            semester: {
                type: string;
                description: string;
                example: string;
            };
            spId: {
                type: string;
                description: string;
                example: string;
            };
            poVersion: {
                type: string;
                description: string;
                example: number;
            };
        };
    };
    ModuleGroup: {
        type: string;
        description: string;
        properties: {
            mgId: {
                type: string;
                description: string;
                example: string;
            };
            version: {
                type: string;
                example: number;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            fullName: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            ectsMin: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            ectsMax: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            order: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
        };
    };
    Module: {
        type: string;
        description: string;
        properties: {
            mId: {
                type: string;
                description: string;
                example: string;
            };
            version: {
                type: string;
                example: number;
            };
            acronym: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            content: {
                type: string;
                description: string;
                example: string;
            };
            skills: {
                type: string;
                description: string;
                example: string;
            };
            addInfo: {
                type: string;
                description: string;
                example: string;
            };
            priorKnowledge: {
                type: string;
                description: string;
                example: string;
            };
            ects: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            term: {
                type: string;
                description: string;
                example: string;
            };
            recTerm: {
                type: string;
                description: string;
                example: string;
            };
            duration: {
                type: string;
                description: string;
                example: string;
            };
            chair: {
                type: string;
                description: string;
                example: string;
            };
            offerBegin: {
                type: string;
                description: string;
                example: string;
            };
            offerEnd: {
                type: string;
                description: string;
                example: null;
            };
            workload: {
                type: string;
                description: string;
                example: string;
            };
            prevModules: {
                type: string;
                description: string;
                example: {};
            };
            respPersonId: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    ModuleExam: {
        type: string;
        description: string;
        properties: {
            meId: {
                type: string;
                description: string;
                example: number;
            };
            shortName: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            duration: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            share: {
                type: string;
                description: string;
                example: string;
            };
            mId: {
                type: string;
                description: string;
                example: string;
            };
            version: {
                type: string;
                example: number;
            };
        };
    };
    ModuleCourse: {
        type: string;
        description: string;
        properties: {
            mcId: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            identifier: {
                type: string;
                description: string;
                example: {};
            };
            type: {
                type: string;
                description: string;
                example: string;
            };
            language: {
                type: string;
                description: string;
                example: string;
            };
            term: {
                type: string;
                description: string;
                example: string;
            };
            order: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            compulsory: {
                type: string;
                description: string;
                example: boolean;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            literature: {
                type: string;
                description: string;
                example: string;
            };
            ects: {
                type: string;
                format: string;
                example: number;
            };
            sws: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
        };
    };
    Person: {
        type: string;
        description: string;
        properties: {
            pId: {
                type: string;
                description: string;
                example: string;
            };
            title: {
                type: string;
                description: string;
                example: string;
            };
            firstname: {
                type: string;
                example: string;
            };
            lastname: {
                type: string;
                example: string;
            };
            email: {
                type: string;
                format: string;
                example: string;
            };
            tel: {
                type: string;
                description: string;
                example: string;
            };
            office: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    Course: {
        type: string;
        description: string;
        properties: {
            id: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            short: {
                type: string;
                description: string;
                example: string;
            };
            organizational: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            literature: {
                type: string;
                description: string;
                example: string;
            };
            addInfo: {
                type: string;
                description: string;
                example: string;
            };
            orgname: {
                type: string;
                description: string;
                example: string;
            };
            chair: {
                type: string;
                description: string;
                example: string;
            };
            type: {
                type: string;
                description: string;
                example: string;
            };
            semester: {
                type: string;
                description: string;
                example: string;
            };
            ects: {
                type: string;
                format: string;
                example: number;
            };
            sws: {
                type: string;
                format: string;
                example: number;
            };
            keywords: {
                type: string;
                description: string;
                example: string;
            };
            lang: {
                type: string;
                description: string;
                example: string;
            };
            expAttendance: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            format: {
                type: string;
                description: string;
                example: string;
            };
            nameEn: {
                type: string;
                description: string;
                example: string;
            };
            literatureEn: {
                type: string;
                description: string;
                example: string;
            };
            organizationalEn: {
                type: string;
                description: string;
                example: string;
            };
            descEn: {
                type: string;
                description: string;
                example: string;
            };
            lastUpdated: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
        };
    };
    Room: {
        type: string;
        description: string;
        properties: {
            id: {
                type: string;
                description: string;
                example: string;
            };
            short: {
                type: string;
                description: string;
                example: string;
            };
            address: {
                type: string;
                description: string;
                example: string;
            };
            size: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
        };
    };
    Term: {
        type: string;
        description: string;
        properties: {
            id: {
                type: string;
                description: string;
                example: number;
            };
            startdate: {
                type: string;
                description: string;
                example: string;
            };
            enddate: {
                type: string;
                description: string;
                example: string;
            };
            starttime: {
                type: string;
                description: string;
                example: string;
            };
            endtime: {
                type: string;
                description: string;
                example: string;
            };
            repeat: {
                type: string;
                description: string;
                example: string;
            };
            exclude: {
                type: string;
                description: string;
                example: string;
            };
            roomId: {
                type: string;
                description: string;
                example: string;
            };
            courseId: {
                type: string;
                description: string;
                example: string;
            };
            semester: {
                type: string;
                example: string;
            };
        };
    };
    AcademicDate: {
        type: string;
        description: string;
        properties: {
            id: {
                type: string;
                example: number;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            startdate: {
                type: string;
                format: string;
                example: string;
            };
            enddate: {
                type: string;
                format: string;
                example: string;
            };
            starttime: {
                type: string;
                example: string;
            };
            endtime: {
                type: string;
                example: string;
            };
            typeId: {
                type: string;
                description: string;
                example: number;
            };
            semester: {
                type: string;
                example: string;
            };
        };
    };
    DateType: {
        type: string;
        description: string;
        properties: {
            typeId: {
                type: string;
                example: number;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    User: {
        type: string;
        description: string;
        properties: {
            _id: {
                type: string;
                description: string;
                example: string;
            };
            shibId: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
                example: string;
            };
            roles: {
                type: string;
                description: string;
                items: {
                    type: string;
                    enum: string[];
                };
                example: string[];
            };
            authType: {
                type: string;
                description: string;
                enum: string[];
                example: string;
            };
            completedModules: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
            startSemester: {
                type: string;
                description: string;
                pattern: string;
                example: string;
            };
            duration: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            maxEcts: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            sps: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
            fulltime: {
                type: string;
                description: string;
                example: boolean;
            };
            dashboardSettings: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        key: {
                            type: string;
                            example: string;
                        };
                        visible: {
                            type: string;
                            example: boolean;
                        };
                    };
                };
            };
            timetableSettings: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        showWeekends: {
                            type: string;
                            example: boolean;
                        };
                    };
                };
            };
            favouriteModulesAcronyms: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            excludedModulesAcronyms: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            hints: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        key: {
                            type: string;
                            example: string;
                        };
                        hasConfirmed: {
                            type: string;
                            example: boolean;
                        };
                    };
                };
            };
            consents: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        ctype: {
                            type: string;
                            example: string;
                        };
                        hasConfirmed: {
                            type: string;
                            example: boolean;
                        };
                        hasResponded: {
                            type: string;
                            example: boolean;
                        };
                        timestamp: {
                            type: string;
                            format: string;
                            example: string;
                        };
                    };
                };
            };
            topics: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            jobs: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
            moduleFeedback: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        acronym: {
                            type: string;
                            example: string;
                        };
                        similarmods: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                        similarchair: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                        priorknowledge: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                        contentmatch: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                    };
                };
            };
            compAims: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        compId: {
                            type: string;
                            example: string;
                        };
                        aim: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                        standard: {
                            type: string;
                            example: string;
                        };
                        parent: {
                            type: string;
                            example: string;
                        };
                    };
                };
            };
            createdAt: {
                type: string;
                format: string;
                example: string;
            };
            updatedAt: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    CompletedModule: {
        type: string;
        description: string;
        properties: {
            mgId: {
                type: string;
                description: string;
                example: string;
            };
            acronym: {
                type: string;
                example: string;
            };
            name: {
                type: string;
                example: string;
            };
            ects: {
                type: string;
                example: number;
            };
            grade: {
                type: string;
                description: string;
                example: number;
            };
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            semester: {
                type: string;
                pattern: string;
                example: string;
            };
            notes: {
                type: string;
                maxLength: number;
                example: string;
            };
            isUserGenerated: {
                type: string;
                example: boolean;
            };
            flexNowImported: {
                type: string;
                description: string;
                example: boolean;
            };
        };
    };
    UserStudyProgramme: {
        type: string;
        description: string;
        properties: {
            spId: {
                type: string;
                example: string;
            };
            poVersion: {
                type: string;
                example: number;
            };
            name: {
                type: string;
                example: string;
            };
            faculty: {
                type: string;
                example: string;
            };
            mhbId: {
                type: string;
                example: string;
            };
            mhbVersion: {
                type: string;
                example: number;
            };
        };
    };
    Job: {
        type: string;
        description: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            title: {
                type: string;
                example: string;
            };
            description: {
                type: string;
                example: string;
            };
            keywords: {
                type: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            inputMode: {
                type: string;
                enum: string[];
                example: string;
            };
            embeddingId: {
                type: string;
                example: string;
            };
            userId: {
                type: string;
                description: string;
                example: string;
            };
            createdAt: {
                type: string;
                format: string;
                example: string;
            };
            updatedAt: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    ExtendedJob: {
        type: string;
        description: string;
        allOf: ({
            $ref: string;
            type?: undefined;
            properties?: undefined;
        } | {
            type: string;
            properties: {
                recModules: {
                    type: string;
                    description: string;
                    items: {
                        $ref: string;
                    };
                };
                loading: {
                    type: string;
                    example: boolean;
                };
            };
            $ref?: undefined;
        })[];
    };
    StudyPlan: {
        type: string;
        description: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            name: {
                type: string;
                example: string;
            };
            status: {
                type: string;
                description: string;
                example: boolean;
            };
            semesterPlans: {
                type: string;
                items: {
                    $ref: string;
                };
            };
            userId: {
                type: string;
                example: string;
            };
            createdAt: {
                type: string;
                format: string;
                example: string;
            };
            updatedAt: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    SemesterPlan: {
        type: string;
        description: string;
        properties: {
            semester: {
                type: string;
                description: string;
                pattern: string;
                example: string;
            };
            isPastSemester: {
                type: string;
                description: string;
                example: boolean;
            };
            modules: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            userGeneratedModules: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
            courses: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                            example: string;
                        };
                        name: {
                            type: string;
                            example: string;
                        };
                        status: {
                            type: string;
                            example: string;
                        };
                        ects: {
                            type: string;
                            example: number;
                        };
                        sws: {
                            type: string;
                            example: number;
                        };
                        contributeTo: {
                            type: string;
                            example: string;
                        };
                        contributeAs: {
                            type: string;
                            example: string;
                        };
                    };
                };
            };
            aimedEcts: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            summedEcts: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            expanded: {
                type: string;
                description: string;
                example: boolean;
            };
            userId: {
                type: string;
                example: string;
            };
        };
    };
    UserGeneratedModule: {
        type: string;
        description: string;
        properties: {
            name: {
                type: string;
                maxLength: number;
                example: string;
            };
            acronym: {
                type: string;
                maxLength: number;
                example: string;
            };
            ects: {
                type: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            notes: {
                type: string;
                maxLength: number;
                example: string;
            };
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            flexNowImported: {
                type: string;
                example: boolean;
            };
        };
    };
    Recommendation: {
        type: string;
        description: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            recommendedMods: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
            userId: {
                type: string;
                example: string;
            };
            createdAt: {
                type: string;
                format: string;
                example: string;
            };
            updatedAt: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    RecommendedModule: {
        type: string;
        description: string;
        properties: {
            acronym: {
                type: string;
                maxLength: number;
                example: string;
            };
            source: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        type: {
                            type: string;
                            enum: string[];
                            example: string;
                        };
                        identifier: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        score: {
                            type: string;
                            description: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                    };
                };
            };
            weight: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            position: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                example: number;
            };
        };
    };
    Topic: {
        type: string;
        description: string;
        properties: {
            tId: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                maxLength: number;
                example: string;
            };
            keywords: {
                type: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            description: {
                type: string;
                example: string;
            };
            parentId: {
                type: string;
                description: string;
                example: string;
            };
            embeddingId: {
                type: string;
                description: string;
                example: string;
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    Embedding: {
        type: string;
        description: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            identifier: {
                type: string;
                description: string;
                example: string;
            };
            vector: {
                type: string;
                description: string;
                items: {
                    type: string;
                    format: string;
                    minimum: number;
                    maximum: number;
                };
                example: number[];
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    ModEmbedding: {
        type: string;
        description: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            acronym: {
                type: string;
                description: string;
                example: string;
            };
            vector: {
                type: string;
                description: string;
                items: {
                    type: string;
                    format: string;
                    minimum: number;
                    maximum: number;
                };
                example: number[];
            };
            createdAt: {
                type: string;
                format: string;
            };
            updatedAt: {
                type: string;
                format: string;
            };
        };
    };
    Error: {
        type: string;
        properties: {
            message: {
                type: string;
                example: string;
            };
            code: {
                type: string;
                example: string;
            };
        };
    };
};
export declare const swaggerBilAppSchema: {
    Standard: {
        type: string;
        description: string;
        properties: {
            stId: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    Competence: {
        type: string;
        description: string;
        properties: {
            compId: {
                type: string;
                description: string;
                example: string;
            };
            short: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            desc: {
                type: string;
                description: string;
                example: string;
            };
            stId: {
                type: string;
                description: string;
                example: string;
            };
            parentId: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    CompetenceCourse: {
        type: string;
        description: string;
        properties: {
            cId: {
                type: string;
                description: string;
                example: string;
            };
            semester: {
                type: string;
                example: string;
            };
            compId: {
                type: string;
                description: string;
                example: string;
            };
            fulfillment: {
                type: string;
                description: string;
                example: number;
            };
        };
    };
    Error: {
        type: string;
        properties: {
            message: {
                type: string;
                example: string;
            };
            code: {
                type: string;
                example: string;
            };
        };
    };
};
