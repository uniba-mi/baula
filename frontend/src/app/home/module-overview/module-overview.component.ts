import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { concat, Observable, of, skipWhile, Subject, switchMap, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  getAllModules,
  getModuleAcronyms,
  getModuleHandbook,
  getModules,
} from 'src/app/selectors/module-overview.selectors';
import { State } from 'src/app/reducers';
import { ModuleHandbook } from '../../../../../interfaces/module-handbook';
import { Module } from '../../../../../interfaces/module';
import {
  OptionGroup,
  Option,
  SearchSettings,
} from '../../../../../interfaces/search';
import { ActivatedRoute, Router } from '@angular/router';
import { ModService } from 'src/app/shared/services/module.service';
import { ModuleGroup } from '../../../../../interfaces/module-group';
import {
  trigger,
  state,
  animate,
  style,
  transition,
} from '@angular/animations';
import { RecsHelperService } from 'src/app/modules/recommendations/recs-helper.service';
import { SearchActions } from 'src/app/actions/search-settings.actions';
import { getSearchSettingsByContext } from 'src/app/selectors/search-settings.selectors';

@Component({
  selector: 'app-module-overview',
  templateUrl: './module-overview.component.html',
  styleUrls: ['./module-overview.component.scss'],
  standalone: false,
  animations: [
    trigger('slideInOut', [
      state('open', style({
        transform: 'translateX(0)', // Volle Sichtbarkeit
      })),
      state('closed', style({
        transform: 'translateX(-200%)', // Komplett ausgeblendet
      })),
      transition('open <=> closed', [
        animate('400ms ease-in-out'), // Geschwindigkeit und Timing
      ]),
    ]),
  ],
})
export class ModuleOverviewComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    if (width < 992) {
      this.sideNavOpened = false;
      this.mobileView = true;
    } else {
      this.sideNavOpened = true;
      this.mobileView = false;
    }
  }

  @ViewChild('sidenavContainer', { read: ElementRef, static: false })
  sidenavContainer: ElementRef;
  @ViewChild('sidenav', { read: ElementRef, static: false })
  sidenav: ElementRef;

  // const variables for view
  maintenance = false; // Variable to disable features and make maintenance message visible
  sideNavOpened = true;
  mobileView = false;
  groupingOptions: Option[] = [
    {
      value: 'struktur',
      name: 'Modulgruppe',
      key: '',
      selected: true,
    },
    {
      value: 'chair',
      name: 'Lehrstuhl',
      key: '',
    },
  ];
  moduleHint: string = 'module-hint';
  moduleHintMessage: string =
    'Hier siehst du alle Module, die in deinem Modulhandbuch vorhanden sind. Module sind thematische Blöcke, die du in deinen Studienverlaufsplan einplanen kannst. Module können wiederum Lehrveranstaltungen enthalten, die du unter Stundenplanung in deinen Stundenplan deines aktuellen Semesters einplanen kannst.';
  filterList: OptionGroup[] = [
    {
      name: 'Angebotssemester',
      options: [
        {
          value: 'SS',
          name: 'Sommer',
          key: 'term',
          selected: false,
        },
        {
          value: 'WS',
          name: 'Winter',
          key: 'term',
          selected: false,
        },
      ],
    },
    {
      name: 'Modulart',
      options: [
        {
          value: 'Pflichtmodul',
          name: 'Pflichtmodul',
          key: 'type',
          selected: false,
        },
        {
          value: 'Wahlmodul',
          name: 'Wahlmodul',
          key: 'type',
          selected: false,
        },
      ],
    },
    {
      name: 'Sonstige',
      options: [
        { value: 'hideTakenPassed', name: 'Belegte und bestandene verstecken', key: 'hideTakenPassed', selected: false, metadata: false }
      ]
    }
  ];

  // variables only for component
  moduleHandbook$: Observable<ModuleHandbook | undefined>;
  mhb: ModuleHandbook;
  selectedGroupFilter: Option | undefined;
  searchSettings$: Observable<SearchSettings | undefined>;
  selectedModuleId: string | undefined;
  modules: Module[] | undefined;
  allModules: Module[] | undefined;
  private destroy$ = new Subject<void>();

  // bindings for group-navigation and group-list
  modules$: Observable<Module[]>;
  selectedGroup: string = 'struktur';
  groups: ModuleGroup[];
  removeGroupFilters: boolean;
  acronyms$: Observable<string[]>;
  elementObserver$: ResizeObserver;
  passedOrTakenAcronyms: string[] = [];

  constructor(
    private store: Store<State>,
    private route: ActivatedRoute,
    private modService: ModService,
    private router: Router,
    private renderer: Renderer2,
    private recsHelper: RecsHelperService
  ) { }

  ngOnInit(): void {
    // Scroll to top of the page on component initialization
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // set observables
    this.moduleHandbook$ = this.store.select(getModuleHandbook);
    this.modules$ = this.store.select(getModules);
    this.acronyms$ = this.store.select(getModuleAcronyms);
    this.searchSettings$ = this.store.select(getSearchSettingsByContext('module-overview'));

    // subscribe to searchSettings to preset grouping
    const mhbSub = this.moduleHandbook$.pipe(skipWhile(mhb => !mhb)).pipe(take(1))
    const soSub = this.searchSettings$.pipe(take(1))
    const modSub = this.store
      .select(getModules)
      .pipe(skipWhile(modules => !modules)).pipe(take(1))

    concat(mhbSub, modSub, soSub).subscribe(value => {
      if (value && 'mhbId' in value) {
        this.mhb = value;
      } else if (value && Array.isArray(value)) {
        this.modules = value;
      } else {
        if (value?.selectedGrouping) {
          this.onGroupingSelectionChange(value.selectedGrouping);
        } else {
          this.onGroupingSelectionChange(this.selectedGroup)
        }
      }
    })

    this.searchSettings$.pipe(takeUntil(this.destroy$)).subscribe(options => {
      if (options && options.filter && options.filter.length !== 0) {
        this.selectedGroupFilter = options.filter.find(el => el.key === 'mgId' || el.key === 'chair')
      } else {
        this.selectedGroupFilter = undefined;
      }
    })

    // needed to open module if reload at open dialog
    this.store
      .select(getAllModules)
      .pipe(skipWhile(modules => !modules || modules.length === 0))
      .pipe(takeUntil(this.destroy$))
      .pipe(
        switchMap((modules) => {
          if (this.allModules?.length === modules.length) {
            return of(undefined)
          }
          this.allModules = modules;
          return this.route.queryParams
        })
      )
      .subscribe((params) => {
        // react on route params if id is set open module
        if (params && params.id && this.selectedModuleId !== params.id) {
          this.selectedModuleId = params.id;
          this.openModule(params.id, params.mgId);
        } else if (!params || this.selectedModuleId !== params.id) {
          this.selectedModuleId = undefined;
        }
      });

    // set initial sidenav status
    this.onResize(window.innerWidth);

    // get study path information for child
    this.recsHelper.getPassedOrTakenModulesFromStudyPath().pipe(
      takeUntil(this.destroy$)
    ).subscribe(passedOrTakenModules => {
      this.passedOrTakenAcronyms = passedOrTakenModules.map(module => module.acronym);
    });
  }

  ngAfterViewInit(): void {
    // part needed to enable resize if tree is expanded
    // height of sidenav depends on mat-sidenav-content, if it is small, sidenav overflows
    this.elementObserver$ = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.renderer.setStyle(
          this.sidenavContainer.nativeElement,
          'min-height',
          (entry.contentRect.height + 100).toString() + 'px'
        );
      }
    });
    this.elementObserver$.observe(this.sidenav.nativeElement);
  }

  toggleSidenav() {
    this.sideNavOpened = !this.sideNavOpened;
  }

  openModule(id: string, mgId: string | undefined) {
    if (this.allModules && this.allModules.length !== 0) {
      const module = this.allModules.find(
        (mod) => mod.mId === id && mod.mgId === mgId
      );
      if (module) {
        this.modService.openDetailsDialog(module, undefined, true);
      } else {
        // try to find module only with mId
        const broaderModule = this.allModules.find(
          (mod) => mod.mId == id
        );
        if (broaderModule) {
          this.modService.openDetailsDialog(broaderModule, undefined, true);
        } else {
          // redirect to base route
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
          });
        }
      }
    }
  }

  searchModules(searchSettings: SearchSettings) {
    this.store.dispatch(
      SearchActions.updateSearchSettings({ context: 'module-overview', searchSettings: searchSettings })
    );
  }

  // handle value changes from group select -> changes the data source of the mat-tree
  onGroupingSelectionChange(value: string): void {
    this.removeGroupFilter();
    // check if value exists in grouping options
    if (this.groupingOptions.find((el) => el.value == value)) {
      this.selectedGroup = value;
      if ((value == 'chair' || value == 'term') && this.modules) {
        let groups: ModuleGroup[] = [];
        const possibleValues = [
          ...new Set(this.modules.map((module) => module[value]))
        ]
        let i = 0;
        for (let pvalue of possibleValues) {
          // startsWith-Condition to filter out all occurences where no chair is adressed
          if (!pvalue.startsWith('Modul')) {
            const index = groups.push(
              new ModuleGroup(i.toString(), 0, '', pvalue, '', 0, 0, 0)
            );
            let filteredModules = this.modules.filter(
              (module) => module[value] == pvalue
            );
            if (filteredModules) {
              groups[index - 1].addModules(filteredModules);
            }
            i++;
          }
        }
        groups = groups.sort((a, b) =>
          a.fullName < b.fullName ? -1 : a.fullName > b.fullName ? 1 : 0
        );
        this.groups = groups;
      } else if (value === 'struktur' && this.mhb) {
        this.groups = this.mhb.mgs;
      }
      this.store.dispatch(SearchActions.updateGroupingOption({ context: 'module-overview', grouping: value }))
    }
  }

  // push command to group-navigation to init removal of groupFilters
  removeGroupFilter() {
    this.removeGroupFilters = !this.removeGroupFilters;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
