import { ChangeDetectorRef, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, catchError, combineLatest, debounceTime, filter, finalize, map, Observable, of, skip, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { getFavouriteModuleAcronyms, getExcludedModulesAcronyms, getUser, getUserTopics } from 'src/app/selectors/user.selectors';
import { User } from '../../../../../../interfaces/user';
import { FormControl } from '@angular/forms';
import { Module } from '../../../../../../interfaces/module';
import { FavoriteModulesActions, UserActions } from 'src/app/actions/user.actions';
import { RecsRestService } from 'src/app/modules/recommendations/recs-rest.service';
import { ModService } from 'src/app/shared/services/module.service';
import { Topic, TopicTree } from '../../../../../../interfaces/topic';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { Recommendation } from '../../../../../../interfaces/recommendation';
import { RecsHelperService } from 'src/app/modules/recommendations/recs-helper.service';
import { SearchSettings } from '../../../../../../interfaces/search';
import { getSearchSettingsByContext } from 'src/app/selectors/search-settings.selectors';
import { SearchActions } from 'src/app/actions/search-settings.actions';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';

@Component({
  selector: 'app-topic-settings',
  standalone: false,

  templateUrl: './topic-settings.component.html',
  styleUrl: './topic-settings.component.scss'
})
export class TopicSettingsComponent {
  user$: Observable<User>;
  searchControl = new FormControl('');

  // topics
  topicTree$: Observable<TopicTree>;
  userTopics$: Observable<string[]>;
  selectedParent: Topic | null = null;
  allSelectedChildren$: Observable<Topic[]>; // for tree iteration
  private currentUserTopics: string[] = [];
  allChildrenTopics$: Observable<Topic[]>
  filteredChildTopics$: Observable<Topic[]> = of([]);
  allTopicsFlat: Topic[] = [];
  topicToggle$ = new Subject<string>();
  allTopics: Topic[];

  // recommendations
  showModuleRecommendations: boolean = true;
  moduleRecommendations: any = null;
  filteredRecommendations: any[] = [];

  excludedModules$ = this.store.select(getExcludedModulesAcronyms);
  favouriteModuleAcronyms$ = this.store.select(getFavouriteModuleAcronyms);
  hideTakenAndPassed: boolean = false;

  // search settings (currently only filtering used)
  searchSettings$: Observable<SearchSettings>;

  // smoother api calling
  private loading$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loading$.asObservable();

  // tracking search terms
  debounceTimer: any = null;   // timer for debounce effekt
  debounceDelay: number = 5000;   // delay
  lastTrackedQuery: string = ''; // store tracked term - passed from html

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private modService: ModService,
    private recsService: RecsRestService,
    private cdr: ChangeDetectorRef,
    private fuseSearchService: FuseSearchService,
    private recsHelper: RecsHelperService,
    private analytics: AnalyticsService
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.userTopics$ = this.store.select(getUserTopics);

    this.userTopics$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(topics => {
      this.currentUserTopics = topics || [];
      this.cdr.detectChanges();
    });

    this.loadTopicData();
    this.initializeTopicSearch();
    this.setupTopicToggle();

    // get settings for filtering the results, currently only filtering
    this.searchSettings$ = this.store.select(getSearchSettingsByContext('personalisation-search'));
    this.loadSearchState();

    this.loadInitialRecommendations();
  }

  loadInitialRecommendations() {
    this.userTopics$.pipe(
      takeUntil(this.destroy$),
      filter(topics => topics && topics.length > 0),
      take(1)
    ).subscribe(userTopics => {
      this.showModuleRecommendations = true;
      if (userTopics && userTopics.length > 0)
        this.fetchTopicRecommendations(userTopics);
    });
  }

  loadTopicData() {
    this.topicTree$ = this.recsService.getTopicTree();
    this.allChildrenTopics$ = this.recsService.getTopicChildren();

    this.allChildrenTopics$.pipe(take(1)).subscribe(topics => {
      this.allTopics = topics || [];
    });

    // reactive list of selected child topics
    this.allSelectedChildren$ = combineLatest([this.userTopics$, this.topicTree$]).pipe(
      map(([userTopics, topicTree]) => {
        if (!topicTree || !topicTree.topics) return [];
        const allChildren = topicTree.topics.flatMap((parent) => parent.children || []);
        return allChildren.filter((child) => userTopics.includes(child.tId));
      })
    );
  }

  fetchTopicRecommendations(topics: string[]) {
    this.loading$.next(true);
    this.recsService.createTopicRecommendation(topics)
      .pipe(
        catchError(error => {
          console.error('Error fetching recommendations:', error);
          return of(null);
        }),
        finalize(() => {
          this.loading$.next(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe(recommendation => {
        if (recommendation) {
          this.processRecommendations(recommendation);
        }
      });
  }

  setupTopicToggle() {
    this.topicToggle$.pipe(
      takeUntil(this.destroy$),
      debounceTime(1500)
    ).subscribe(() => {
      this.store.select(getUserTopics).pipe(
        take(1)
      ).subscribe(userTopics => {
        if (userTopics) {
          this.fetchTopicRecommendations(userTopics);
        }
      });
    });

    // listen for changes in excluded modules and favourites and update display
    this.excludedModules$.pipe(
      takeUntil(this.destroy$),
      skip(1),
      debounceTime(500)
    ).subscribe(() => {
      if (this.moduleRecommendations) {
        this.processRecommendations(this.moduleRecommendations)
      }
    });

    this.favouriteModuleAcronyms$.pipe(
      takeUntil(this.destroy$),
      skip(1)
    ).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  loadSearchState() { // currently only filters
    this.store.select(getSearchSettingsByContext('personalisation-search')).pipe(
      take(1)
    ).subscribe(settings => {
      const takenPassedFilter = settings?.filter?.find(f => f.key === 'hideTakenAndPassed');
      if (takenPassedFilter) {
        this.hideTakenAndPassed = takenPassedFilter.value as boolean;
      }
    });
  }

  processRecommendations(recommendation: Recommendation) {
    this.moduleRecommendations = recommendation;

    combineLatest([
      this.recsHelper.getPassedOrTakenModulesFromStudyPath(),
      this.excludedModules$
    ]).pipe(
      take(1)
    ).subscribe(([passedOrTakenModules, excludedModules]) => {
      const excludeModuleAcronyms = [
        ...passedOrTakenModules.map(module => module.acronym),
        ...excludedModules
      ];

      if (recommendation && recommendation.recommendedMods && recommendation.recommendedMods.length > 0) {
        let filtered = recommendation.recommendedMods.filter(mod => {
          const hasTopicSource = mod.source && mod.source.some(src => src.type === 'topic');
          const isNotExcluded = this.hideTakenAndPassed ? !excludeModuleAcronyms.includes(mod.acronym) : true; // apply the taken/passed filter here
          return hasTopicSource && isNotExcluded;
        });

        // sort by frequency (number of sources)
        filtered = filtered.sort((a, b) => {
          const freqA = a.source ? a.source.filter(src => src.type === 'topic').length : 0;
          const freqB = b.source ? b.source.filter(src => src.type === 'topic').length : 0;
          return freqB - freqA;
        });

        this.filteredRecommendations = filtered;
        this.fetchModuleDetails();
      } else {
        this.filteredRecommendations = [];
      }

      this.cdr.detectChanges();
    });
  }

  // need module details for card display
  fetchModuleDetails(): void {
    if (this.filteredRecommendations.length === 0) return;

    const acronyms = this.filteredRecommendations.map(mod => mod.acronym);
    if (acronyms.length === 0) return;

    // preserve order
    const metadataByAcronym: any = {};
    const orderMap: any = {};

    this.filteredRecommendations.forEach((mod, index) => {
      metadataByAcronym[mod.acronym] = {
        frequency: mod.source ? mod.source.length : 0,
        source: mod.source || [],
        weight: mod.weight || 0
      };
      orderMap[mod.acronym] = index;
    });

    this.modService.getFullModulesByAcronyms(acronyms).subscribe(fullModules => {
      const modulesWithMetadata = fullModules.map(fullModule => {
        const metadata = metadataByAcronym[fullModule.acronym] || { frequency: 0, source: [], weight: 0 };
        return {
          ...fullModule,
          metadata: {
            frequency: metadata.frequency,
            source: metadata.source,
            weight: metadata.weight
          },
          _sortIndex: orderMap[fullModule.acronym]
        };
      });

      this.filteredRecommendations = modulesWithMetadata.sort((a, b) =>
        a._sortIndex - b._sortIndex
      );

      this.cdr.detectChanges();
    });
  }

  selectParentTopic(topic: Topic): void {
    this.selectedParent = topic;
    topic.showChildren = !topic.showChildren;
    this.cdr.detectChanges();
  }

  toggleTopic(tId: string): void {
    this.loading$.next(true);
    this.store.dispatch(UserActions.toggleTopic({ topic: tId }));
    this.topicToggle$.next(tId);
  }

  isSelected(tId: string): boolean {
    return this.currentUserTopics.includes(tId);
  }

  onModuleMarkedExcluded(acronym: string): void {
    this.filteredRecommendations = this.filteredRecommendations.filter(
      mod => mod.acronym !== acronym
    );
    this.cdr.detectChanges();
  }

  onModuleFavouriteToggled(acronym: string): void {
    this.store.dispatch(FavoriteModulesActions.toggleFavouriteModule({ acronym }));
    this.cdr.detectChanges();
  }

  initializeTopicSearch(): void {
    combineLatest([
      this.allChildrenTopics$,
      this.topicTree$
    ]).pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(([allChildren, topicTree]) => {
      if (topicTree && topicTree.topics) {
        this.allTopicsFlat = topicTree.topics.flatMap(parent =>
          parent.children ? parent.children : []
        );
      }

      if (allChildren && allChildren.length > 0) {
        const allTopicsMap = new Map<string, Topic>();

        [...this.allTopicsFlat, ...allChildren].forEach(topic => {
          if (topic && topic.tId) {
            allTopicsMap.set(topic.tId, topic);
          }
        });

        this.allTopicsFlat = Array.from(allTopicsMap.values());
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      if (!searchTerm) {
        this.filteredChildTopics$ = of([]);
        return;
      }

      const term = searchTerm as string;
      this.filteredChildTopics$ = of(this.searchTopics(term));

      this.trackTopicSearch(term);
    });
  }

  searchTopics(searchTerm: string): Topic[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    searchTerm = searchTerm.trim();

    return this.fuseSearchService.search(
      this.allTopicsFlat,
      searchTerm,
      ['name', 'keywords', 'description'],
      undefined,
      0.2 // low fuzziness
    );
  }

  selectTopicFromSearch(topic: Topic): void {
    if (!this.isSelected(topic.tId)) {
      this.toggleTopic(topic.tId);
    }

    this.searchControl.setValue(''); // clear field
  }

  openModuleDetails(mod: Module) {
    this.modService.openDetailsDialog(mod);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // tracking with plausible
  private trackTopicSearch(term: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (term.trim() !== '' && term !== this.lastTrackedQuery) {
        this.analytics.trackEvent('TopicSearch', { action: 'Search Topic', term });
        this.lastTrackedQuery = term;
      }
      this.debounceTimer = null;
    }, this.debounceDelay);
  }
}
