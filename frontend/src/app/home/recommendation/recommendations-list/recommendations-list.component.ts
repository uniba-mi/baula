import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { FavoriteModulesActions } from 'src/app/actions/user.actions';
import { SearchActions } from 'src/app/actions/search-settings.actions';
import { catchError, combineLatest, finalize, Observable, of, take } from 'rxjs';
import { RecsHelperService } from 'src/app/modules/recommendations/recs-helper.service';
import { ModService } from 'src/app/shared/services/module.service';
import { RecsRestService } from 'src/app/modules/recommendations/recs-rest.service';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { getJobs, getExcludedModulesAcronyms } from 'src/app/selectors/user.selectors';
import { getSearchSettingsByContext } from 'src/app/selectors/search-settings.selectors';
import { Module } from '../../../../../../interfaces/module';
import { ModuleWithMetadata } from '../../../../../../interfaces/recommendation';
import { OptionGroup, Option, SearchSettings } from '../../../../../../interfaces/search';
import { Job } from '../../../../../../interfaces/job';
import { Topic } from '../../../../../../interfaces/topic';

@Component({
  selector: 'app-recommendations-list',
  standalone: false,
  templateUrl: './recommendations-list.component.html',
  styleUrl: './recommendations-list.component.scss'
})
export class RecommendationsListComponent implements OnInit {

  @Input() preview: boolean = false;
  @Input() maxPreviewItems: number = 6;
  @Output() hasRecommendations = new EventEmitter<boolean>();

  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLDivElement>;
  canScrollLeft = false;
  canScrollRight = false;

  private rawRecommendations: any[] = []; // api response
  recommendations: ModuleWithMetadata[] = []; // final processed modules

  isLoading: boolean = false;

  // search settings
  searchSettings$: Observable<SearchSettings>;
  currentSearchTerm: string = '';
  currentlySelectedFilters: Option[] = [];

  topicsArray: Topic[] = [];
  jobsArray: Job[] = [];

  filterList: OptionGroup[] = [
    {
      name: 'Angebotssemester',
      options: [
        { value: 'SS', name: 'Sommer', key: 'term', selected: false, metadata: false },
        { value: 'WS', name: 'Winter', key: 'term', selected: false, metadata: false }
      ],
    },
    {
      name: 'Modulart',
      options: [
        { value: 'Pflichtmodul', name: 'Pflichtmodul', key: 'type', selected: false, metadata: false },
        { value: 'Wahlmodul', name: 'Wahlmodul', key: 'type', selected: false, metadata: false }
      ],
    },
    {
      name: 'Passt zu:',
      options: [
        { value: 'Jobs', name: 'Jobs', key: 'source', selected: false, metadata: true },
        { value: 'Interesse', name: 'Interesse', key: 'source', selected: false, metadata: true },
        { value: 'Feedback', name: 'Feedback', key: 'source', selected: false, metadata: true },
      ],
    },
    {
      name: 'Sonstige',
      options: [
        { value: 'hideTakenPassed', name: 'Belegte und bestandene verstecken', key: 'hideTakenPassed', selected: false, metadata: false }
      ]
    }
  ];
  private excludedModules$ = this.store.select(getExcludedModulesAcronyms);

  constructor(
    private store: Store,
    private recsHelper: RecsHelperService,
    private fuseSearchService: FuseSearchService,
    private modService: ModService,
    private recsService: RecsRestService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.searchSettings$ = this.store.select(getSearchSettingsByContext('personalisation-search'));

    this.loadSearchState();
    this.loadRecommendations();
    this.loadMetadata();

    this.excludedModules$.subscribe(() => {
      if (this.rawRecommendations.length) {
        this.applyFilters();
      }
    });
  }

  private loadRecommendations(): void {
    this.isLoading = true;
    this.recsService.getPersonalRecommendations()
      .pipe(
        catchError(error => {
          console.error('Error fetching recommendations:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        this.rawRecommendations = response?.[0]?.recommendedMods || [];
        this.applyFilters();
      });
  }

  ngAfterViewInit(): void {
    if (this.preview) {
      setTimeout(() => this.updateScrollButtons(), 100);
    }
  }

  scrollLeft(): void {
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  onScroll(): void {
    this.updateScrollButtons();
  }

  private updateScrollButtons(): void {
    if (!this.scrollContainer) return;

    const container = this.scrollContainer.nativeElement;
    this.canScrollLeft = container.scrollLeft > 0;
    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);
    this.cdr.detectChanges();
  }

  private loadSearchState(): void {
    this.searchSettings$.pipe(take(1)).subscribe(settings => {
      if (settings?.term) {
        this.currentSearchTerm = settings.term;
      }

      if (settings?.filter) {
        settings.filter.forEach(savedFilter => {
          this.filterList.forEach(group => {
            const option = group.options.find(opt =>
              opt.key === savedFilter.key && opt.value === savedFilter.value
            );
            if (option) {
              option.selected = true;
            }
          });
        });
        this.currentlySelectedFilters = settings.filter;
      }
    });
  }

  private loadMetadata(): void {
    this.recsService.getTopicChildren().pipe(take(1)).subscribe(topics => {
      this.topicsArray = topics || [];
    });

    this.store.select(getJobs).subscribe(jobs => {
      this.jobsArray = jobs || [];
    });
  }

  private applyFilters(): void {
    combineLatest([
      this.recsHelper.getPassedOrTakenModulesFromStudyPath(),
      this.excludedModules$.pipe(take(1))
    ])
      .subscribe(([passedOrTakenModules, excludedModules]) => {
        if (!this.rawRecommendations.length) {
          this.updateRecommendations([]);
          return;
        }

        const excludedAcronyms = excludedModules || [];
        let filtered = this.rawRecommendations.filter(mod =>
          !excludedAcronyms.includes(mod.acronym)
        );

        const shouldHide = this.currentlySelectedFilters.some(f => f.key === 'hideTakenPassed');
        if (shouldHide) {
          const passedTakenAcronyms = passedOrTakenModules.map(m => m.acronym);
          filtered = filtered.filter(mod => !passedTakenAcronyms.includes(mod.acronym));
        }

        filtered.sort((a, b) => {
          const scoreA = a.source?.filter((s: any) => !s.type?.includes('feedback')).length || 0;
          const scoreB = b.source?.filter((s: any) => !s.type?.includes('feedback')).length || 0;

          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }

          // sort alphabetically for ties
          return a.acronym.localeCompare(b.acronym);
        });

        this.processModules(filtered);
      });
  }

  private processModules(recommendedMods: any[]): void {
    if (!recommendedMods.length) {
      this.updateRecommendations([]);
      return;
    }

    const acronyms = recommendedMods.map(m => m.acronym);
    const metadataMap = new Map();

    recommendedMods.forEach((mod, index) => {
      metadataMap.set(mod.acronym, {
        frequency: mod.source?.filter((s: any) => !s.type?.includes('feedback')).length || 0,
        source: mod.source || [],
      })
    });

    this.modService.getFullModulesByAcronyms(acronyms).subscribe(fullModules => {

      // preserve rec order
      let modules: any[] = acronyms
        .map(acronym => {
          const fullModule = fullModules.find(m => m.acronym === acronym);
          if (!fullModule) return null;

          return {
            ...fullModule,
            metadata: metadataMap.get(acronym) || { frequency: 0, source: [] },
          };
        })
        .filter(m => m !== null);

      // searching
      if (this.currentSearchTerm.trim()) {
        modules = this.fuseSearchService.search(modules, this.currentSearchTerm, ['name', 'acronym']);
      }

      if (this.currentlySelectedFilters.length) {
        modules = this.filterModules(modules);
      }

      // cast to modulewithmetadata
      const sorted = modules
        .sort((a, b) => (a._sortIndex || 0) - (b._sortIndex || 0))
        .map(({ _sortIndex, ...module }) => module as ModuleWithMetadata);

      this.updateRecommendations(sorted);
    });
  }

  private filterModules(modules: any[]): any[] {
    return modules.filter(module =>
      this.currentlySelectedFilters.every(filter => {

        if (filter.key === 'hideTakenPassed') return true;

        // metadata filters (Jobs/Interesse)
        if (filter.metadata) {
          if (!module.metadata?.source) return false;
          const typeMap: Record<string, string> = { Jobs: 'job', Interesse: 'topic', Feedback: 'feedback_similarmods' };
          return module.metadata.source.some((s: any) => s.type === typeMap[filter.value as string]);
        }

        // regular filters (term, type)
        const value = module[filter.key as keyof Module];
        return value?.includes?.(filter.value as string) || value === filter.value;
      })
    );
  }

  private updateRecommendations(modules: ModuleWithMetadata[]): void {
    this.recommendations = modules;
    this.hasRecommendations.emit(modules.length > 0);
    this.cdr.detectChanges();

    if (this.preview) {
      setTimeout(() => this.updateScrollButtons(), 100);
    }
  }

  private updateSearchSettings(term?: string, filters?: Option[]): void {
    this.store.dispatch(SearchActions.updateSearchSettings({
      context: 'personalisation-search',
      searchSettings: {
        term: term ?? this.currentSearchTerm,
        searchIn: [],
        filter: filters ?? this.currentlySelectedFilters
      }
    }));
  }

  searchModules(event: SearchSettings): void {
    this.currentSearchTerm = event.term;

    if (event.filter) {
      this.currentlySelectedFilters = event.filter;
    }

    this.updateSearchSettings(event.term, this.currentlySelectedFilters);
    this.applyFilters();
  }

  onFilterChange(selectedFilters: Option[]): void {
    this.currentlySelectedFilters = selectedFilters;
    this.updateSearchSettings();
    this.applyFilters();
  }

  showAllModules(): void {
    this.currentSearchTerm = '';
    this.updateSearchSettings('');
    this.applyFilters();
  }

  onModuleMarkedExcluded(acronym: string): void {
    this.recommendations = this.recommendations.filter(m => m.acronym !== acronym);
  }

  onModuleFavouriteToggled(acronym: string): void {
    this.store.dispatch(FavoriteModulesActions.toggleFavouriteModule({ acronym }));
  }

  openModuleDetails(module: Module): void {
    this.modService.openDetailsDialog(module);
  }

  // for preview displayal
  get displayedRecommendations(): ModuleWithMetadata[] {
    return this.preview ? this.recommendations.slice(0, this.maxPreviewItems) : this.recommendations;
  }
}