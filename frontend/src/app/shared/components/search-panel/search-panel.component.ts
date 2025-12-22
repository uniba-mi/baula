import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Option,
  OptionGroup,
  SearchSettings,
} from '../../../../../../interfaces/search';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  fromEvent,
} from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss'],
  standalone: false
})
export class SearchPanelComponent implements OnInit {
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @Input() searchSettings: SearchSettings | undefined | null;
  @Input() filterOptions: OptionGroup[];
  @Input() customStyle: boolean = false; // for reuse with different style
  @Input() horizontalFilters: boolean = true; // for reuse with different style, default horizontal
  @Input() hideTakenAndPassed: boolean;
  @Output() search = new EventEmitter<SearchSettings>();
  @Output() filter = new EventEmitter<Option[]>();
  @Output() clear = new EventEmitter<string>();
  @Output() notify = new EventEmitter();
  @Output() toggleTakenAndPassed = new EventEmitter<boolean>();

  panelState: boolean = false;
  searchTerm: string = '';
  panelSearchSettings: SearchSettings; // local search settings
  selectedFiltersCount$ = new BehaviorSubject<number>(0);

  // tracking search terms
  debounceTimer: any = null;   // timer for debounce effekt
  debounceDelay: number = 5000;   // delay
  lastTrackedQuery: string = ''; // store tracked term - passed from html

  constructor(private route: ActivatedRoute, private analytics: AnalyticsService) { }

  ngOnInit(): void {
    fromEvent(this.searchInput.nativeElement, 'input')
      .pipe(
        // wait 500 ms before trigger search
        debounceTime(500),
      )
      .subscribe(() => {
        this.emitSearch();
      });

    if (this.searchSettings) {
      this.searchTerm = this.searchSettings.term;
      if (this.searchSettings.filter) {
        this.patchFilterOptions(this.searchSettings.filter);
      } else {
        this.emitFiltering();
      }
    }

    this.calculateSelectedFiltersCount();

    // react on query param
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.query) {
        this.searchTerm = queryParams.query;
        this.emitSearch();
      }
    });
  }

  // toggle chips
  toggleSelection(option: Option) {
    option.selected = !option.selected;
    this.calculateSelectedFiltersCount();
    this.emitFiltering();
  }

  // get selected chips
  getSelectedFilters(): Option[] {
    return this.filterOptions
      .map((group) => group.options)
      .reduce((allOptions, groupOptions) => allOptions.concat(groupOptions), [])
      .filter((option) => option.selected)
      .map((option) => ({
        value: option.value,
        name: option.name,
        key: option.key,
        metadata: option.metadata,
      }));
  }

  clearInput() {
    this.searchTerm = '';
    this.emitSearch();
  }

  togglePanel() {
    this.panelState = !this.panelState;
  }

  emitSearch() {
    // need to reset module groups in module overview when search is triggered
    // otherwise only modules of the current group are shown again
    this.clear.emit();
    this.panelSearchSettings = {
      term: this.searchTerm,
      searchIn: ['name', 'content', 'skills', 'chair', 'acronym'], // search in everything except priorKnowledge
      filter: this.getSelectedFilters(),
    };

    this.search.emit(this.panelSearchSettings);

    // clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // set new debounce timer for tracking
    this.debounceTimer = setTimeout(() => {

      // only track if search term has changed and is not empty
      if (this.searchTerm.trim() !== '' && this.searchTerm !== this.lastTrackedQuery) {

        this.analytics.trackEvent('ModuleSearch', {
          action: 'Search Module',
          term: this.panelSearchSettings.term,
          filters: JSON.stringify(this.getSelectedFilters())
        });

        this.lastTrackedQuery = this.searchTerm; // store last tracked query
      }

      this.debounceTimer = null; // reset timer
    }, this.debounceDelay);

    // if term is not empty, notify parent component to update module list
    if (this.searchTerm !== '') {
      this.notify.emit();
    }
  }

  emitFiltering() {
    const filtersValue = this.getSelectedFilters() || undefined;
    this.filter.emit(filtersValue);
    this.emitSearch();
  }

  // calculation for red filter badge
  calculateSelectedFiltersCount() {
    const count = this.filterOptions
      .map((group) => group.options.filter((option) => option.selected).length)
      .reduce((acc, val) => acc + val, 0);
    this.selectedFiltersCount$.next(count);
  }

  private patchFilterOptions(options: Option[]) {
    let filterOptions = this.filterOptions.reduce(
      (pv: Option[], cv: OptionGroup) => pv.concat(cv.options),
      []
    );
    for (let opt of options) {
      filterOptions.map((filter) =>
        filter.value === opt.value ? (filter.selected = true) : filter
      );
    }
    this.emitFiltering();
  }
}
