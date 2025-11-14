import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { OptionGroup, Option, SearchSettings } from '../../../../../../interfaces/search';
import { RecsHelperService } from '../recs-helper.service';
import { Store } from '@ngrx/store';
import { getJobs } from 'src/app/selectors/user.selectors';
import { PathModule } from '../../../../../../interfaces/study-path';
import { Observable, take, tap } from 'rxjs';
import { Module } from '../../../../../../interfaces/module';
import { RecsRestService } from '../recs-rest.service';
import { ConfirmationDialogData, ConfirmationDialogComponent } from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FavoriteModulesActions } from 'src/app/actions/user.actions';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { ModuleWithMetadata } from '../../../../../../interfaces/recommendation';
import { ExtendedJob, Job } from '../../../../../../interfaces/job';
import { Topic } from '../../../../../../interfaces/topic';
import { getSearchSettingsByContext } from 'src/app/selectors/search-settings.selectors';
import { SearchActions } from 'src/app/actions/search-settings.actions';
import { User } from '../../../../../../interfaces/user';
import { RecsTabService } from '../recs-tab.service';

@Component({
  selector: 'app-recs-sidenav',
  templateUrl: './recs-sidenav.component.html',
  styleUrls: ['./recs-sidenav.component.scss'],
  standalone: false,
})

export class RecsSidenavComponent implements OnInit, OnChanges {

  @Input() spId: string;
  @Input() plannedModules: string[];
  @Input() user: User;
  @Output() tabClicked = new EventEmitter<number>();
  @Output() toggleSidenav = new EventEmitter<number>();

  // Core data structures
  passedModules$: Observable<PathModule[]>;
  droppedModules: Set<string> = new Set();
  isSmallScreen: boolean = false;
  passedOrTakenAcronyms: string[] = [];

  tabs = [
    { label: 'Passend', icon: 'bi bi-person-circle text-gray', infoText: 'Module, die laut deinen Einstellungen unter "Personalisierung" zu dir passen.' },
    { label: 'Neu', icon: 'bi bi-stars text-gray', infoText: 'Module, die neu im Angebot sind.' },
    // { label: 'Beliebt', icon: 'bi bi-people-fill text-gray', infoText: 'Module, die Studierende deines Studiengangs häufig belegen.' },
    { label: 'Entdecken', icon: 'bi bi-binoculars-fill text-gray', infoText: 'Verschiedene Module, die du interessant finden könntest.' },
    { label: 'Gemerkt', icon: 'bi bi-bookmark-fill text-gray', infoText: 'Module, die du dir gemerkt hast.' }
  ];
  selectedTabIndex: number = 0;
  favouriteModulesTabIndex: number = 4;

  // data for module lists
  newModules$: Observable<Module[]>;
  personalModules$: Observable<ModuleWithMetadata[]>;
  serendipitousModules$: Observable<Module[]>;
  favouriteModules$: Observable<Module[]>;

  hints = {
    serendipity: {
      key: 'serendipity-hint',
      message: 'Diese Liste zeigt Module, die Studierende deines Studiengangs oft wählen. Bitte beachte, dass die Universität Bamberg mit ihren Studiengängen ein breites Wissensangebot anbietet, das hier nicht abgebildet ist. Bitte informiere dich abseits dieser Liste über die vielfältigen Möglichkeiten deines Studiengangs.'
    },
    newModules: {
      key: 'newModules-hint',
      message: 'Diese Liste zeigt Module, die in einer neuen Version angeboten werden. Dies sind teilweise neu entstandene Module, können jedoch im individuellem Fall auch eine Lehrstuhländerung oder Restrukturierung des bisherigen Modules bedeuten.'
    },
    serendipitousModules: {
      key: 'serendipitous-modules-hint',
      message: 'Diese Liste zeigt Module aus deinem Modulhandbuch, die du vielleicht noch nicht kennst.'
    },
    personalModules: {
      key: 'personalModules-hint',
      message: 'Diese Liste zeigt Module, die zu den Angaben passen, die du unter "Personalisierung" gemacht hast (z. B. Jobs, Interessen).'
    }
  };

  searchSettings$: Observable<SearchSettings>;
  currentSearchTerm: string = '';
  currentlySelectedFilters: Option[] = [];
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
      name: 'Sonstige',
      options: [
        { value: 'hideTakenPassed', name: 'Belegte und bestandene verstecken', key: 'hideTakenPassed', selected: false, metadata: false }
      ]
    }
  ];
  personalTabFilters: OptionGroup = {
    name: 'Passt zu:',
    options: [
      { value: 'Jobs', name: 'Jobs', key: 'source', selected: false, metadata: true },
      { value: 'Interesse', name: 'Interesse', key: 'source', selected: false, metadata: true },
      { value: 'Feedback', name: 'Feedback', key: 'source', selected: false, metadata: true },
    ],
  };

  allJobs$: Observable<ExtendedJob[] | undefined>;
  allTopics$: Observable<Topic[] | undefined>;
  topicsArray: Topic[] = [];
  jobsArray: Job[] = [];
  isWIAIStudent: boolean = false;

  constructor(
    private matDialog: MatDialog,
    private store: Store,
    private recsService: RecsRestService,
    private recsHelperService: RecsHelperService,
    private screenSizeService: ScreenSizeService,
    private recsTabService: RecsTabService
  ) { }

  ngOnInit() {
    this.initializeBasicSettings();
    this.initializePassedModules();
    this.initializeModuleStreams();

    this.searchSettings$ = this.store.select(getSearchSettingsByContext('recs-search'));
    this.loadSearchState();

    // initialise droppedModules with plannedModules
    this.droppedModules = new Set(this.plannedModules || []);

    // pass dropped modules to service
    this.recsTabService.setDroppedModules(Array.from(this.droppedModules));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plannedModules && changes.plannedModules.currentValue) {
      this.droppedModules = new Set(this.plannedModules);

      this.recsTabService.setDroppedModules(Array.from(this.droppedModules));
    }

    // hide personalisation tab for non wiai students
    if (changes.user && this.user.sps && this.user.sps.length > 0) {
      if (this.user.sps[0].faculty === 'WIAI') {
        this.isWIAIStudent = true;
      }
    }
  }

  private initializeBasicSettings() {
    this.screenSizeService.isSmallScreen$.pipe(take(1)).subscribe(isSmall => {
      this.isSmallScreen = isSmall;
    });

    this.favouriteModulesTabIndex = this.tabs.findIndex(tab => tab.label === 'Gemerkt');
  }

  private initializeModuleStreams() {
    this.allTopics$ = this.recsService.getTopicChildren();
    this.allJobs$ = this.store.select(getJobs);

    this.newModules$ = this.recsTabService.initializeNewModules();
    this.serendipitousModules$ = this.recsTabService.initializeSerendipitousModules(this.spId);
    this.personalModules$ = this.recsTabService.initializePersonalModules(this.allTopics$, this.allJobs$);
    this.favouriteModules$ = this.recsTabService.initializeFavoriteModules();

    this.allTopics$.pipe(take(1)).subscribe(topics => {
      this.topicsArray = topics || [];
    });

    this.allJobs$.pipe(take(1)).subscribe(jobs => {
      this.jobsArray = jobs || [];
    });
  }

  private initializePassedModules() {

    this.passedModules$ = this.recsHelperService.getPassedOrTakenModulesFromStudyPath();

    this.passedModules$.pipe(
      tap(passedOrTakenModules => {
        if (passedOrTakenModules) {
          const passedOrTakenAcronyms = passedOrTakenModules.map(m => m.acronym);
          this.recsTabService.setPassedOrTakenModules(passedOrTakenAcronyms);
          this.passedOrTakenAcronyms = passedOrTakenAcronyms;
        }
      })
    ).subscribe();
  }

  loadSearchState(): void {
    this.store.select(getSearchSettingsByContext('recs-search')).pipe(
      take(1)
    ).subscribe(settings => {
      if (settings?.term) {
        this.currentSearchTerm = settings.term;
        this.recsTabService.setSearchTerm(settings.term);
      }

      if (settings?.filter) { // load filters
        settings.filter.forEach(savedFilter => {
          this.filterList.forEach(group => {
            const option = group.options.find(opt => opt.key === savedFilter.key && opt.value === savedFilter.value);
            if (option) {
              option.selected = savedFilter.selected || false;
            }
          });
        });

        this.currentlySelectedFilters = settings.filter;
        this.recsTabService.setSelectedFilters(settings.filter);

        const takenPassedFilter = settings.filter.find(f => f.key === 'hideTakenPassed');
        this.recsTabService.setHidePlannedAndPassed(takenPassedFilter?.selected || false);
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.updateFilterList();
    this.tabClicked.emit(index); // emit to parent, so it can open
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit() // emit to parent, so it can close
  }

  updateFilterList(): void {
    if (this.selectedTabIndex === 0) { // personal tab
      if (!this.filterList.includes(this.personalTabFilters)) {
        this.filterList.push(this.personalTabFilters);
      }
    } else {
      this.filterList = this.filterList.filter(group => group !== this.personalTabFilters);
    }
  }

  showAllModules(): void {
    this.currentSearchTerm = '';
    this.recsTabService.setSearchTerm('');

    this.store.dispatch(SearchActions.updateSearchSettings({
      context: 'recs-search',
      searchSettings: {
        term: '',
        searchIn: [],
        filter: this.currentlySelectedFilters
      }
    }));
  }

  searchModules(event: SearchSettings): void {
    this.currentSearchTerm = event.term;
    this.recsTabService.setSearchTerm(event.term);

    this.store.dispatch(SearchActions.updateSearchSettings({
      context: 'recs-search',
      searchSettings: {
        term: event.term,
        searchIn: event.searchIn || [],
        filter: this.currentlySelectedFilters
      }
    }));
  }

  filterModules(selectedFilters: Option[]): void {
    this.currentlySelectedFilters = selectedFilters;
    this.recsTabService.setSelectedFilters(selectedFilters);

    this.store.dispatch(SearchActions.updateSearchSettings({
      context: 'recs-search',
      searchSettings: {
        term: this.currentSearchTerm,
        searchIn: [],
        filter: selectedFilters
      }
    }));

    const takenPassedFilter = selectedFilters.find(f => f.key === 'hideTakenPassed');
    const isHideTakenPassedActive = !!takenPassedFilter;
    this.recsTabService.setHidePlannedAndPassed(isHideTakenPassedActive);
  }

  updateFavouriteModules(acronym: string): void {
    this.store.dispatch(FavoriteModulesActions.toggleFavouriteModule({ acronym }));
  }

  openDeleteFavouritesDialog(): void {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Merkliste löschen?',
      actionType: 'delete',
      confirmationItem: 'deine gemerkten Module',
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.deleteFavourites();
      },
    };
    this.matDialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  deleteFavourites() {
    this.store.dispatch(FavoriteModulesActions.deleteFavouriteModules());
    this.matDialog.closeAll();
  }

  markModuleAsDropped(acronym: string): void {
    this.droppedModules.add(acronym);

    this.recsTabService.setDroppedModules(Array.from(this.droppedModules));
  }
}