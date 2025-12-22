import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
} from '@angular/forms';
import {
  Option,
  SearchSettings,
} from '../../../../../../interfaces/search';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/rest.service';
import { debounceTime, fromEvent, Observable, skipWhile, Subject, take, takeUntil } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';
import { getSearchSettingsByContext } from 'src/app/selectors/search-settings.selectors';

@Component({
  selector: 'app-course-search-panel',
  templateUrl: './course-search-panel.component.html',
  styleUrls: ['./course-search-panel.component.scss'],
  standalone: false
})
export class CourseSearchPanelComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<SearchSettings>();
  @Output() openSidenav = new EventEmitter<Boolean>();
  @ViewChild('select') select: MatSelect;
  @ViewChild('courseSearchInput', { static: true }) courseSearchInput: ElementRef;
  ngUnsubscribe = new Subject<void>();
  searchSettings$: Observable<SearchSettings | undefined>;
  searchSettings: SearchSettings;

  panelState: boolean = false;
  searchTerm: string = '';
  timeExpanded: boolean = false;
  selectedFilters = new UntypedFormControl();
  faculties$: Observable<string[]>;
  types$: Observable<string[]>;
  selectedFiltersCount$ = new BehaviorSubject<number>(0);
  detailSearchExpanded: boolean = false;
  // for fulltext toggle
  fulltextSearchEnabled: boolean = false;

  // tracking
  private trackDebounceTimer: any = null;
  private trackDebounceDelay: number = 5000;
  private lastTrackedQuery: string = '';

  searchInOptions: Option[] = [
    {
      value: 'name',
      name: 'Titel',
      key: 'name',
      selected: true,
    },
    {
      value: 'desc',
      name: 'Beschreibung',
      key: 'desc',
    },
    {
      value: 'short',
      name: 'Kurzbezeichnung',
      key: 'short',
      selected: true,
    },
    {
      value: 'organizational',
      name: 'Organisatorisches',
      key: 'organizational',
    },
    {
      value: 'mId',
      name: 'Modulnummer/kürzel',
      key: 'mId',
      selected: true,
    },
  ];

  advancedSearchOptions = this.fb.group({
    searchInFields: new FormControl(
      this.searchInOptions.filter((el) => el.selected).map((el) => el.key)
    ),
    detailSearch: this.fb.array([
      this.fb.group({
        term: [''],
        searchIn: [''],
      }),
    ]),
    filter: this.fb.group({
      time: this.fb.group({
        day: [''],
        timeStart: [''],
        timeEnd: [''],
      }),
      types: [''],
      departments: [''],
      onlyModuleCourses: false,
      onlySelectedCourses: false,
    }),
  });

  constructor(
    private store: Store<State>,
    private route: ActivatedRoute,
    private rest: RestService,
    private fb: FormBuilder,
    private analytics: AnalyticsService
  ) { }

  ngOnInit(): void {
    fromEvent(this.courseSearchInput.nativeElement, 'input')
      .pipe(
        // wait 500 ms before trigger search
        debounceTime(500),
      )
      .subscribe(() => {
        this.emitSearch(false);
      });

    this.faculties$ = this.rest.getDepartments();
    this.types$ = this.rest.getCourseTypes();
    this.searchSettings$ = this.store
      .select(getSearchSettingsByContext('course-search'))
      .pipe(takeUntil(this.ngUnsubscribe));

    // calculate filter badge update based on changes
    this.advancedSearchOptions.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((values) => {
        this.calculateSelectedFiltersCount();
      });

    // react on query param
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(skipWhile((queryParams) => Object.keys(queryParams).length === 0))
      .subscribe((queryParams) => {
        if (Object.keys(queryParams).length !== 0) {
          // reset search query
          this.resetSearchOptions();

          const mId = queryParams.module ? queryParams.module : undefined;
          const types = queryParams.types
            ? queryParams.types.split(' und ')
            : undefined;
          if (mId) {
            this.advancedSearchOptions.controls['detailSearch'].patchValue([
              { term: mId, searchIn: 'mId' },
            ]);
            this.detailSearchExpanded = true;
          }
          if (types) {
            this.advancedSearchOptions.controls['filter'].controls[
              'types'
            ].patchValue(types);
          }
          this.openSidenav.emit(true);
          this.emitSearch(false);
        } else {
          // reset Searchoptions if queryparams are unset
          this.resetAllFilters();
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  emitSearch(close: boolean) {
    if (this.advancedSearchOptions.controls['searchInFields'].value) {
      this.searchSettings = {
        term: this.searchTerm,
        searchIn: this.advancedSearchOptions.controls['searchInFields'].value,
        advancedSearch: this.advancedSearchOptions.value,
      };

      if (close) {
        this.togglePanel();
      }
      this.search.emit(this.searchSettings);

      // delayed tracking logic
      this.trackSearchEvent(this.searchSettings);
    }
  }

  // catches detail search request
  onDetailSearchChange(event: Event) {
    event.preventDefault();
    this.emitSearch(false)
  }

  private trackSearchEvent(searchSettings: SearchSettings): void {
    if (this.trackDebounceTimer) {
      clearTimeout(this.trackDebounceTimer);
    }

    this.trackDebounceTimer = setTimeout(() => {
      // Only track if the search term or filters have changed
      const filtersApplied = searchSettings.advancedSearch?.filter;
      const hasFilters = filtersApplied && Object.values(filtersApplied).some(value => value);

      if ((searchSettings.term.trim() !== '' || hasFilters) && searchSettings.term !== this.lastTrackedQuery) {

        this.analytics.trackEvent('CourseSearch', {
          action: 'Search Course',
          term: searchSettings.term,
          filters: JSON.stringify(searchSettings.advancedSearch?.filter)
        });

        this.lastTrackedQuery = searchSettings.term; // prevent duplicate tracking
      }

      this.trackDebounceTimer = null;
    }, this.trackDebounceDelay);
  }

  toggleTime() {
    this.timeExpanded = !this.timeExpanded;
  }

  get detailSearchFields() {
    return this.advancedSearchOptions.controls['detailSearch'] as FormArray;
  }

  addDetailSearchField(term?: string, searchIn?: string) {
    term = term ? term : '';
    searchIn = searchIn ? searchIn : '';
    const detailSearchField = this.fb.group({
      term: [term],
      searchIn: [searchIn],
    });
    this.detailSearchFields.push(detailSearchField);
  }

  toggleFulltextSearch() {
    this.fulltextSearchEnabled = !this.fulltextSearchEnabled;
    const searchFields = this.fulltextSearchEnabled
      ? ['mId', 'name', 'short', 'desc', 'organizational']
      : ['mId', 'name']; // default

    this.advancedSearchOptions.controls['searchInFields'].patchValue(
      searchFields
    );
    this.emitSearch(false);
  }

  removeDetailSearchField(index: number) {
    this.detailSearchFields.removeAt(index);
  }

  clearInput() {
    this.searchTerm = '';
    this.emitSearch(false);
  }

  togglePanel() {
    this.panelState = !this.panelState;
  }

  resetFilter(controlName: string) {
    const control = this.advancedSearchOptions.get(`filter.${controlName}`);
    if (control instanceof FormControl) {
      control.reset('');
    } else if (control instanceof FormArray) {
      control.reset([]);
    } else if (control instanceof FormGroup) {
      control.reset({
        day: '',
        timeEnd: '',
        timeStart: '',
      });
    }
    this.calculateSelectedFiltersCount();
  }

  resetDetailSearchField(index: number) {
    const detailSearchArray = this.advancedSearchOptions.get(
      'detailSearch'
    ) as FormArray;
    detailSearchArray.at(index).reset({
      term: '',
      searchIn: '',
    });
    this.calculateSelectedFiltersCount();
  }

  resetSearchOptions() {
    this.resetFilter('time');
    this.resetFilter('departments');
    this.resetFilter('types');
    this.resetFilter('onlyModuleCourses');
    this.resetFilter('onlySelectedCourses');
    this.searchTerm = '';
    this.fulltextSearchEnabled = false;
    this.advancedSearchOptions.controls['searchInFields'].patchValue([
      'name',
      'mId',
    ]);
    this.advancedSearchOptions.controls['detailSearch'].patchValue([
      {
        term: '',
        searchIn: '',
      }
    ]);
  }

  resetAllFilters() {
    this.resetSearchOptions();
    this.emitSearch(false)
  }

  // calculate selected filters count to display in badge
  calculateSelectedFiltersCount() {
    let count = 0;

    // detail search fields
    const detailSearchArray = this.advancedSearchOptions.get(
      'detailSearch'
    ) as FormArray;
    count += detailSearchArray.controls.reduce(
      (acc, control) =>
        acc + (control.value.term || control.value.searchIn ? 1 : 0),
      0
    );

    // filters
    const filterGroup = this.advancedSearchOptions.get('filter') as FormGroup;
    Object.values(filterGroup.controls).forEach((control) => {
      if (control instanceof FormControl) {
        const value = control.value;
        if (Array.isArray(value)) {
          // count each option
          count += value.length;
        } else if (value && value !== 'Alle') {
          count++; // alle is not counted
        }

        // for time & day
      } else if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((subControl) => {
          if (
            subControl instanceof FormControl &&
            subControl.value &&
            subControl.value !== 'Alle'
          ) {
            count++;
          }
        });
      }
    });

    // Emit the new count
    this.selectedFiltersCount$.next(count);
  }

  patchValuesToForm(options: SearchSettings) {
    if (options.searchIn.length > 2) {
      this.advancedSearchOptions.controls['searchInFields'].patchValue(
        options.searchIn
      );
      this.fulltextSearchEnabled = true;
    }

    if (options.advancedSearch && options.advancedSearch.detailSearch) {
      for (let detailSearch of options.advancedSearch.detailSearch) {
        this.advancedSearchOptions.controls['detailSearch'].patchValue([
          { term: detailSearch.term, searchIn: detailSearch.searchIn },
        ]);
      }
      this.detailSearchExpanded = true;
    }

    if (options.advancedSearch && options.advancedSearch.filter) {
      for (let [key, value] of Object.entries(options.advancedSearch.filter)) {
        if (key === 'time' || key === 'types' || key === 'departments') {
          this.advancedSearchOptions.controls['filter'].controls[
            key
          ].patchValue(value);
        } else if (key === 'onlyModuleCourses') {
          this.advancedSearchOptions.controls['filter'].controls[
            key
          ].patchValue(value);
        }
      }
    }

    this.calculateSelectedFiltersCount();
  }
}
