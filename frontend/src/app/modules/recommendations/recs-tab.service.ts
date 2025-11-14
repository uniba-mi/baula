import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { ModService } from 'src/app/shared/services/module.service';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { Store, select } from '@ngrx/store';
import { getNewModules } from 'src/app/selectors/module-overview.selectors';
import { getFavouriteModuleAcronyms, getExcludedModulesAcronyms } from 'src/app/selectors/user.selectors';
import { RecsRestService } from './recs-rest.service';
import { RecsHelperService } from './recs-helper.service';
import { Module } from '../../../../../interfaces/module';
import { ModuleWithMetadata } from '../../../../../interfaces/recommendation';
import { Topic } from '../../../../../interfaces/topic';
import { ExtendedJob } from '../../../../../interfaces/job';

@Injectable({
  providedIn: 'root'
})
export class RecsTabService {

  // search and filter state
  private searchTerm$ = new BehaviorSubject<string>('');
  private selectedFilters$ = new BehaviorSubject<any[]>([]);
  private passedModules$ = new BehaviorSubject<string[]>([]); // are filtered out
  private droppedModules$ = new BehaviorSubject<string[]>([]); // are marked with css
  private excludedModules$ = new BehaviorSubject<string[]>([]);

  private hideTakenAndPassedSubject = new BehaviorSubject<boolean>(false);
  hideTakenAndPassed$ = this.hideTakenAndPassedSubject.asObservable();

  constructor(
    private store: Store,
    private modService: ModService,
    private recsService: RecsRestService,
    private recsHelperService: RecsHelperService,
    private fuseSearchService: FuseSearchService
  ) {
    // initialise excluded modules
    this.store.select(getExcludedModulesAcronyms).subscribe(modules => {
      this.excludedModules$.next(modules);
    });
  }

  initializeNewModules(): Observable<Module[]> {
    return this.store.select(getNewModules).pipe(
      switchMap(modules => this.applyFiltersAndSearch(modules))
    );
  }

  initializeSerendipitousModules(spId: string): Observable<Module[]> {
    return this.recsHelperService.getSerendipitousModules(spId).pipe(
      switchMap(modules => this.applyFiltersAndSearch(modules))
    );
  }

  initializePersonalModules(allTopics$: Observable<Topic[] | undefined>, allJobs$: Observable<ExtendedJob[] | undefined>): Observable<ModuleWithMetadata[]> {
    return combineLatest([
      this.recsService.getPersonalRecommendations().pipe(
        map(recommendations => recommendations[0]?.recommendedMods || []),
        map(modules => modules.map(module => ({
          acronym: module.acronym,
          frequency: module.source.filter((s: any) => !s.type?.includes('feedback')).length,
          source: module.source,
        }))),
        switchMap(modules => {
          const acronyms = modules.map(m => m.acronym);
          return this.modService.getFullModulesByAcronyms(acronyms).pipe(
            map(fullModules => {
              const modulesWithMetadata = fullModules.map(fullModule => {
                const rec = modules.find(r => r.acronym === fullModule.acronym);
                return {
                  ...fullModule,
                  metadata: {
                    frequency: rec?.frequency || 0,
                    source: rec?.source || [],
                  },
                } as ModuleWithMetadata;
              });

              const sorted = modulesWithMetadata.sort((a, b) => {

                const freqDiff = b.metadata!.frequency - a.metadata!.frequency;
                if (freqDiff !== 0) return freqDiff;

                // alphabetical sort (ties)
                return a.acronym.localeCompare(b.acronym);
              });

              return sorted;
            })
          );
        })
      ),
      allTopics$ || of([]),
      allJobs$ || of([])
    ]).pipe(
      map(([modules]) => modules),
      switchMap(modules => this.applyFiltersAndSearch(modules as unknown as Module[]) as unknown as Observable<ModuleWithMetadata[]>)
    );
  }

  initializeFavoriteModules(): Observable<Module[]> {
    return this.store.pipe(
      select(getFavouriteModuleAcronyms),
      switchMap(acronyms => this.modService.getFullModulesByAcronyms(acronyms)),
      switchMap(modules => this.applyFiltersAndSearch(modules))
    );
  }

  setDroppedModules(modules: string[]): void {
    this.droppedModules$.next(modules);
  }

  getDroppedModules(): Observable<string[]> {
    return this.droppedModules$.asObservable();
  }

  setSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  setSelectedFilters(filters: any[]): void {
    this.selectedFilters$.next(filters);
  }

  setPassedOrTakenModules(modules: string[]): void {
    this.passedModules$.next(modules);
  }

  private applyFiltersAndSearch(modules: Module[]): Observable<Module[]> {
    return combineLatest([
      of(modules),
      this.searchTerm$,
      this.selectedFilters$,
      this.passedModules$,
      this.excludedModules$,
      this.hideTakenAndPassedSubject,
    ]).pipe(
      map(([modules, searchTerm, filters, passedModules, excludedModules, hideTakenAndPassed]) => {
        // filter out passed modules, excluded modules, and thesis modules
        let filteredModules = modules.filter(module =>
          !excludedModules.includes(module.acronym) &&
          !this.recsHelperService.isThesis(module.name) &&
          (!hideTakenAndPassed || !passedModules.includes(module.acronym))
        );

        if (searchTerm.trim() !== '') {
          filteredModules = this.fuseSearchService.search(
            filteredModules,
            searchTerm,
            ['name', 'acronym']
          );
        }

        if (filters.length > 0) {
          filteredModules = this.applyFilters(filteredModules, filters);
        }

        return filteredModules;
      })
    );
  }

  setHidePlannedAndPassed(hide: boolean): void {
    this.hideTakenAndPassedSubject.next(hide);
  }

  private applyFilters(modules: Module[], filters: any[]): Module[] {
    return modules.filter((module: Module | ModuleWithMetadata) => {
      return filters.every((filter) => {

        // skip hideTakenPassed
        if (filter.key === 'hideTakenPassed') {
          return true;
        }

        if (filter.metadata === true) {
          if ((module as ModuleWithMetadata).metadata?.source) {
            const filterValueToSourceTypeMap: { [key: string]: string } = {
              Jobs: 'job',
              Interesse: 'topic',
              Feedback: 'feedback_similarmods'
            };
            const mappedSourceType = filterValueToSourceTypeMap[filter.value as string];
            return (module as ModuleWithMetadata).metadata!.source.some(
              (source: { type: string; }) => source.type === mappedSourceType
            );
          }
          return false;
        }
        return (
          module[filter.key as keyof typeof module]?.includes(filter.value) ||
          module[filter.key as keyof typeof module] === filter.value
        );
      });
    });
  }
}