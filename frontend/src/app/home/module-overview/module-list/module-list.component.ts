import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { Module } from '../../../../../../interfaces/module';
import {
  Option,
  SearchSettings,
} from '../../../../../../interfaces/search';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { Observable } from 'rxjs';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { State } from 'src/app/reducers';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.scss'],
  standalone: false
})
export class ModuleListComponent implements OnInit, OnChanges {
  //@Input() moduleGroup: ModuleGroup;
  @Input() modules: Module[] | null;
  @Input() searchSettings: SearchSettings | null | undefined;
  @Input() passedOrTakenAcronyms: string[] = [];
  @Input() acronyms: string[] | null | undefined;
  //@Output() empty = new EventEmitter<{ mgId: String, empty: boolean }>();
  searchResult: Module[] = [];
  compulsory: string = '';
  structure$: Observable<ExtendedModuleGroup[]>;

  constructor(private fuseSearch: FuseSearchService, private store: Store<State>) { }

  ngOnInit(): void {
    if (this.modules) {
      this.searchResult = this.searchModules(this.modules);
    }
    this.structure$ = this.store.select(getStructuredModuleGroups);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.modules && this.modules) {
      this.searchResult = this.searchModules(this.modules);
    }
    if (
      this.searchSettings &&
      changes.searchSettings &&
      this.modules
    ) {
      this.searchResult = this.searchModules(this.modules);
    }

    if (this.modules) {
      this.searchResult = this.searchModules(this.modules);
    }
  }

  filterModules(modules: Module[], filters: Option[]): Module[] {

    const hideTakenPassedFilter = filters.find(filter => filter.key === 'hideTakenPassed');
    let result = modules;
    if (hideTakenPassedFilter && hideTakenPassedFilter.value === 'hideTakenPassed') {
      result = this.filterTakenAndPassedModules(result);
    }

    const regularFilters = filters.filter(filter => filter.key !== 'hideTakenPassed');

    if (regularFilters.length > 0) {
      result = result.filter((module) => {
        return regularFilters.every((filter) => {
          /** Currently three possible cases for regular filters
           *  1. module contains filter value in the requested key (like name)
           *  2. module requested key exactly matches the filter value
           *  3. module id is contained in filter value -> needed if parent group is selected
           */
          return (
            module[filter.key as keyof typeof module].includes(filter.value) ||
            module[filter.key as keyof typeof module] === filter.value ||
            (typeof filter.value == 'string' && filter.value.includes(module[filter.key as keyof typeof module]))
          );
        });
      });
    }
    return result;
  }

  searchModules(modules: Module[]): Module[] {
    // perform filtering before search
    if (this.searchSettings) {
      let result = modules;

      if (this.searchSettings.filter && this.searchSettings.filter.length > 0) {
        result = this.filterModules(modules, this.searchSettings.filter);
      }
      if (this.searchSettings && this.searchSettings.term !== '' && this.acronyms) {
        result = this.fuseSearch.search(
          result,
          this.searchSettings.term,
          this.searchSettings.searchIn,
          this.acronyms,
          0.2
        )
      }
      return result;
    } else {
      return modules;
    }
  }

  filterTakenAndPassedModules(modules: Module[]): Module[] {
    return modules.filter(module =>
      !this.passedOrTakenAcronyms.includes(module.acronym)
    );
  }
}
