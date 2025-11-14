import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { getAllUniqueChairs, getChairByModuleAcronym, getModules } from 'src/app/selectors/module-overview.selectors';
import { getUserStudyPath } from 'src/app/selectors/user.selectors';
import { PlanningValidationService } from '../../shared/services/planning-validation.service';
import { RecsRestService } from 'src/app/modules/recommendations/recs-rest.service';
import { ModService } from 'src/app/shared/services/module.service';
import { Module } from '../../../../../interfaces/module';
import { StudyPath } from '../../../../../interfaces/study-path';

@Injectable({
    providedIn: 'root',
})
export class RecsHelperService {
    studyPath$: Observable<StudyPath>;

    constructor(
        private store: Store,
        private recsService: RecsRestService,
        private planningValidationService: PlanningValidationService,
        private modService: ModService,
    ) {
        this.studyPath$ = this.store.select(getUserStudyPath);
    }

    /***********************************************************************************************************************
     *                                                MODULES FROM SP RETRIEVAL                                              *
     ***********************************************************************************************************************/

    // gets passed and Taken modules from study path
    getPassedOrTakenModulesFromStudyPath() {
        return this.studyPath$.pipe(
            map((studyPath) => studyPath.completedModules),
            map((modules) =>
                modules.filter(
                    (module) => module.status === 'passed' || module.status === 'taken'
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

    // collects all serendipitous modules
    getSerendipitousModules(spId: string): Observable<Module[]> {

        // random modules from new chairs (chairs which are not in study path)
        const newChairModules$ = this.getModulesFromNewChairs().pipe(
            switchMap(chairs => {
                if (chairs && chairs.length > 0) {
                    return this.getRandomModuleFromEachChair(chairs);
                }
                return of([]);
            })
        );

        return newChairModules$;
    }

    /***********************************************************************************************************************
     *                                                HELPERS                                              *
     ***********************************************************************************************************************/

    // get modules that are from chairs non-existent in the study path (= new)
    // if less than 5 modules in study path, returns empty, please do compulsory stuff first
    getModulesFromNewChairs(): Observable<string[] | undefined> {
        return this.store.select(getUserStudyPath).pipe(
            map(studyPath => studyPath.completedModules),
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
