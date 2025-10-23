import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { getAllUniqueChairs, getChairByModuleAcronym, getModules } from 'src/app/selectors/module-overview.selectors';
import { getUserStudypath } from 'src/app/selectors/user.selectors';
import { PlanningValidationService } from '../../shared/services/planning-validation.service';
import { RecsRestService } from 'src/app/modules/recs/recs-rest.service';
import { ModulePasses } from '../../../../../interfaces/recommendation';
import { ModService } from 'src/app/shared/services/module.service';
import { Module } from '../../../../../interfaces/module';
import { Studypath } from '../../../../../interfaces/studypath';

@Injectable({
    providedIn: 'root',
})
export class RecHelperService {
    studypath$: Observable<Studypath>;

    constructor(
        private store: Store,
        private recsService: RecsRestService,
        private planningValidationService: PlanningValidationService,
        private modService: ModService,
    ) {
        this.studypath$ = this.store.select(getUserStudypath);
    }

    // is currently not called; get semester recommendations for the modules within the studyplan
    // getSemesterRecommendations(
    //     progressPlans: Semesterplan[]
    // ): Observable<string[]> {
    //     let moduleIdCollection: string[] = [];
    //     for (let pp of progressPlans) {
    //         let ppIndex = progressPlans.indexOf(pp);
    //         // get semester count for the current spp
    //         let semester = ppIndex + 1;
    //         // get modules within the spp
    //         this.store.select(getModulesWithinSemesterplanOfSelectedStudyplan(pp._id)).subscribe((moduleIds) => {
    //             if (moduleIds) {
    //                 for (let modId of moduleIds) {
    //                     this.store.select(getModuleById(modId)).subscribe((module) => {
    //                         if (module) {
    //                             // TODO: ranges
    //                             // wenn recSemester vorhanden
    //                             if (module.recTerm !== '' && module.recTerm !== '0') {
    //                                 let recTerm = Number(module.recTerm);
    //                                 if (this.isDifferenceCrucial(semester, recTerm)) {
    //                                     moduleIdCollection.push(modId);
    //                                 }
    //                             }
    //                         }
    //                     });
    //                 }
    //             }
    //         });
    //     }
    //     let moduleIds$ = of(moduleIdCollection);
    //     return moduleIds$;
    // }

    // checks if the difference between the semester and the recommended term is greater than 2
    // isDifferenceCrucial(semester: number, recTerm: any) {
    //     if (Math.abs(semester - recTerm) >= 2) {
    //         return true;
    //     }
    //     if (Math.abs(recTerm - semester) >= 2) {
    //         return true;
    //     }
    //     return false;
    // }


    /***********************************************************************************************************************
     *                                                SUCCESSORS                                              *
     ***********************************************************************************************************************/

    getFilteredRecommendableSuccessors(spId: string, modAcr: string, n: number): Observable<ModulePasses[]> {
        return this.recsService.getTopNSuccessors(spId, modAcr, n).pipe(
            // filter taken and passes modules
            map(successors => successors.filter(suc => this.isModuleRecommendable(suc.Module))),
            switchMap(successors => {
                const acronyms = successors.map(suc => suc.Module);
                // get full module data, return only those where module could be found
                return this.modService.getFullModulesByAcronyms(acronyms).pipe(
                    map(modulesInState => {
                        return modulesInState.map(moduleInState => {
                            const matchedSuccessor = successors.find(suc => suc.Module === moduleInState.acronym);
                            return {
                                Module: moduleInState.acronym,
                                Frequency: matchedSuccessor ? matchedSuccessor.Frequency : 0,
                                // append title for hover
                                Title: moduleInState.name
                            };
                        });
                    })
                );
            }),
            // Filter out any entries that do not have a frequency (i.e., not found in successors)
            map(filteredSuccessors => filteredSuccessors.filter(fs => fs.Frequency > 0))
        );
    }


    // module has not been taken or passed
    isModuleRecommendable(mod: string): boolean {
        let recommendable: boolean = true;
        this.planningValidationService
            .getLatestStatusOfModuleByAcronym(mod)
            .subscribe((status) => {
                if (status === 'taken' || status === 'passed') {
                    recommendable = false;
                } else {
                    recommendable = true;
                }
            });
        return recommendable;
    }

    /***********************************************************************************************************************
     *                                                MODULES FROM SP RETRIEVAL                                              *
     ***********************************************************************************************************************/

    // gets passed and Taken modules from studypath
    getPassedOrTakenModulesFromStudypath() {
        return this.studypath$.pipe(
            map((studypath) => studypath.completedModules),
            map((modules) =>
                modules.filter(
                    (module) => module.status === 'passed' || module.status === 'taken'
                )
            )
        );
    }

    // gets passed modules from studypath
    getPassedModulesFromStudypath() {
        return this.studypath$.pipe(
            map((studypath) => studypath.completedModules),
            map((modules) =>
                modules.filter(
                    (module) => module.status === 'passed'
                )
            )
        );
    }

    // help identify thesis modules to exclude them from recommendation
    isThesis(name: string): boolean {
        const lowercaseName = name.toLowerCase();
        const thesisKeywords = [
            'bachelorarbeit',
            'masterarbeit',
            'bachelorthesis',
            'masterthesis',
            'ma-arbeit',
            'ba-arbeit',
            'abschlussarbeit'
        ];

        return thesisKeywords.some(keyword => lowercaseName.includes(keyword));
    }

    // help identify thesis modules to exclude them from recommendation
    isCompulsoryModule(type: string): boolean {
        return type === "Pflichtmodul";
    }

    /***********************************************************************************************************************
     *                                                SERENDIPITY                                              *
     ***********************************************************************************************************************/

    // collects all serendipitous modules by different sources
    getSerendipitousModules(spId: string): Observable<Module[]> {

        // least passed in the cohort data
        const leastPassedModulesAcronyms$ = this.recsService.getBottomNCommonPasses(spId, 5);
        const leastPassedModules$ = leastPassedModulesAcronyms$.pipe(
            switchMap(modulePasses => {

                // make sure this is an array
                if (!Array.isArray(modulePasses)) {
                    return of([]);
                }

                const acronyms = modulePasses.map(mp => mp.Module);
                return this.modService.getFullModulesByAcronyms(acronyms).pipe(
                    map(modules => modules.map(module => {
                        return {
                            ...module,
                            recSource: 'less-popular'
                        } as Module;
                    }))
                );
            })
        );

        // random modules from new chairs (chairs which are not in studypath)
        const newChairModules$ = this.getModulesFromNewChairs().pipe(
            switchMap(chairs => {
                if (chairs && chairs.length > 0) {
                    return this.getRandomModuleFromEachChair(chairs);
                }
                return of([]);
            }),
            map(modules => modules.map(module => {
                return {
                    ...module,
                    recSource: 'new-chair'
                } as Module;
            }))
        );

        // merge all lists (if available)
        return combineLatest([leastPassedModules$, newChairModules$]).pipe(
            map(([leastPopular, newChairs]) => {
                return leastPopular.length > 0 ? [...leastPopular, ...newChairs] : newChairs;
            })
        );
    }

    /***********************************************************************************************************************
     *                                                HELPERS                                              *
     ***********************************************************************************************************************/

    // get modules that are from chairs non-existent in the studypath (= new)
    // if less than 5 modules in studypath, returns empty, please do compulsory stuff first
    getModulesFromNewChairs(): Observable<string[] | undefined> {
        return this.store.select(getUserStudypath).pipe(
            map(studypath => studypath.completedModules),
            withLatestFrom(this.store.select(getAllUniqueChairs)),
            map(([modules, allChairs]) => {
                // if (modules.length < 5) {
                //     return undefined;
                // }
                const chairSet = new Set<string>();
                modules.forEach(module => {
                    this.store.select(getChairByModuleAcronym(module.acronym)).pipe(take(1)).subscribe(chair => {
                        if (chair) {
                            chairSet.add(chair);
                        }
                    });
                });
                return allChairs.filter(chair => !chairSet.has(chair));
            })
        );
    }

    // fetch module by chair, one random (except thesis)
    getRandomModuleFromEachChair(chairs: string[]): Observable<Module[]> {
        return this.store.select(getModules).pipe(
            map(modules => {
                const chairModules = chairs.map(chair => {
                    // exclude thesis modules
                    const filteredModules = modules.filter(
                        module => module.chair === chair && !this.isThesis(module.name) && !this.isCompulsoryModule(module.type)
                    );
                    if (filteredModules.length === 0) {
                        return undefined;
                    }
                    return filteredModules[Math.floor(Math.random() * filteredModules.length)];
                });
                return chairModules.filter(module => module !== undefined);
            })
        );
    }
}
