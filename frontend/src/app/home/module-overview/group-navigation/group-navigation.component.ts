import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ModuleGroup } from '../../../../../../interfaces/module-group';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import {
  Option,
  SearchSettings,
} from '../../../../../../interfaces/search';
import { Module } from '../../../../../../interfaces/module';
import { skipWhile, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { getHoveredModule } from 'src/app/selectors/module-overview.selectors';
import { getUserStudyPath } from 'src/app/selectors/user.selectors';
import { PathModule } from '../../../../../../interfaces/study-path';
import { SearchActions } from 'src/app/actions/search-settings.actions';

@Component({
    selector: 'app-group-navigation',
    templateUrl: './group-navigation.component.html',
    styleUrl: './group-navigation.component.scss',
    standalone: false
})
export class GroupNavigationComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('tree', { read: ElementRef, static: false })
  treeElement: ElementRef;
  @Input() groups: ModuleGroup[] | undefined;
  @Input() selectedGroup: string;
  @Input() modules: Module[] | null;
  @Input() removeGroupFilters: boolean;
  @Input() searchSettings: SearchSettings | undefined | null;

  private destroy$ = new Subject<void>(); // container for subscriptions

  expandedModuleDescription: boolean = false;
  treeControl = new NestedTreeControl<ModuleGroup>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<ModuleGroup>();
  selectedGroupFilter: Option | undefined;

  constructor(private store: Store<State>, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // subscribe to hovered Module
    this.store
      .select(getHoveredModule)
      .pipe(takeUntil(this.destroy$))
      .subscribe((hoveredModule) => {
        // only hover if no group is selected
        if (!this.selectedGroupFilter && this.groups) {
          // check if hovered module is set, otherwise remove all marked-node classes -> since hover is unset
          if (hoveredModule) {
            let moduleGroup;
            // differ between struktur and chair, since chair needs fullname to compare and has only one level
            // for additional grouping cases add further cases!
            if (this.selectedGroup == 'struktur') {
              moduleGroup = this.getModuleGroup(
                hoveredModule.mgId,
                this.dataSource.data
              );
            } else if (this.selectedGroup == 'chair') {
              moduleGroup = this.dataSource.data.find(
                (el) => el.fullName == hoveredModule.chair
              );
            }
            if (moduleGroup) {
              this.markSelectedGroupFilter(moduleGroup);
            }
          } else {
            this.removeMarkedClass();
          }
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.groups && this.groups) {
      this.setDataSource(this.groups);

      this.store
        .select(getUserStudyPath)
        .pipe(takeUntil(this.destroy$))
        .pipe(
          skipWhile(
            (el) =>
              el.completedModules.length == 0 &&
              this.dataSource.data.length == 0
          )
        )
        .subscribe((studyPath) => {
          if (this.dataSource.data && studyPath.completedModules) {
            this.clearAchievedECTS(this.dataSource.data);
            this.dataSource.data = this.setAchievedEcts(
              this.dataSource.data,
              studyPath.completedModules
            );
          }
        });
    }

    // TODO cleaner solution? Quick fix to make sure the chair filter is still active after leaving and coming back to the module catalog.
    if (changes.selectedGroup) {

      this.removeMarkedClass();

      setTimeout(() => {
        if (this.searchSettings?.filter && this.groups) {
          const filter = this.searchSettings.filter.find(
            (el) => el.key === 'mgId' || el.key === 'chair'
          );
          if (filter) {
            let group: ModuleGroup | undefined;

            if (this.selectedGroup === 'chair' && filter.key === 'chair') {
              group = this.groups.find(g => g.fullName === filter.value);
            } else if (this.selectedGroup === 'struktur' && filter.key === 'mgId') {
              const id = filter.value.toString().split(' ')[0];
              group = this.getModuleGroup(id, this.groups);
            }

            if (group) {
              this.setOptionForFilter(group);
              this.markSelectedGroupFilter(group);
            }
          }
        }
        this.cdr.detectChanges();
      }, 0);
    }

    if (changes.removeGroupFilters) {
      this.removeGroupFilter();
    }
  }

  ngAfterViewInit(): void {
    // if filter is preselected, find group and set highlighting
    if (this.searchSettings?.filter && this.groups) {
      const filter = this.searchSettings.filter.find(
        (el) => el.key === 'mgId' || el.key === 'chair'
      );
      if (filter) {
        const id = filter.value.toString().split(' ')[0]
        const group = this.getModuleGroup(id, this.groups);
        if (group) {
          this.setOptionForFilter(group);
          this.markSelectedGroupFilter(group);
          this.cdr.detectChanges();
        }
      }
    }
  }

  setDataSource(groups: ModuleGroup[]) {
    this.dataSource.data = groups;
  }

  hasChild = (_: number, node: ModuleGroup) =>
    !!node.children && node.children.length > 0;

  // main selection function, removes existing marking and mark new selection
  selectFilter(event: any, group: ModuleGroup) {
    event.stopPropagation();
    if (this.selectedGroupFilter) {
      // check case if same filter is clicked again
      if (
        this.selectedGroupFilter.name === group.fullName ||
        this.selectedGroupFilter.name === group.name
      ) {
        this.removeGroupFilter();
      } else {
        // if selected is not the same filter, then first remove current filter and set new one
        this.removeGroupFilter();
        const option = this.setOptionForFilter(group);
        this.store.dispatch(
          SearchActions.addFilterOption({
            context: 'module-overview',
            option,
          })
        );
        this.markSelectedGroupFilter(group);
      }
    } else {
      this.removeMarkedClass();
      const option = this.setOptionForFilter(group);
      this.store.dispatch(
        SearchActions.addFilterOption({
          context: 'module-overview',
          option,
        })
      );
      this.markSelectedGroupFilter(group);
    }
  }

  // function to mark group path -> given the module group
  markSelectedGroupFilter(group: ModuleGroup) {
    this.addMarkedClass(group.mgId);
    if (this.selectedGroup == 'struktur') {
      this.checkForSelectionInStructure(group);
    }
  }

  // function to toggle the description
  toggleModuleDescription(event: any, mg: ModuleGroup) {
    event.stopPropagation();
    const element = document.getElementById(`${mg.mgId}-description`);
    const icon = document.getElementById(`${mg.mgId}-icon`);
    if (element !== null && icon !== null) {
      if (icon.classList.contains('bi-chevron-down')) {
        element.classList.remove('truncate-text');
        icon.classList.remove('bi-chevron-down');
        icon.classList.add('bi-chevron-up');
      } else if (icon.classList.contains('bi-chevron-up')) {
        element.classList.add('truncate-text');
        icon.classList.remove('bi-chevron-up');
        icon.classList.add('bi-chevron-down');
      }
    }
  }

  // function to remove current selection
  removeGroupFilter() {
    if (this.selectedGroupFilter) {
      const key = this.selectedGroupFilter.key;
      this.selectedGroupFilter = undefined;
      this.removeMarkedClass();
      this.store.dispatch(SearchActions.deleteFilterOption({
        context: 'module-overview', 
        key
      }));
    }
  }

  // function to make only one node expandable
  toggleNode(group: ModuleGroup) {
    const currentSelection = this.treeControl.expansionModel.selected;
    const selectionToKeep = currentSelection.filter(mg => {
      // check cases to keep selection
      // case if current selected mg fits to clicked mg (default to keep selected)
      if(mg.mgId === group.mgId) {
        return true;
      } else if(group.parent) {
        // if it not fits, check if parent exist and check for potential additional parents
        if(mg.mgId === group.parent.mgId) {
          return true;
        } else {
          return this.checkForParentWithinSelection(mg.mgId, group.parent)
        }
      }
      
      // default case return false
      return false;
    })
    this.treeControl.collapseAll();
    for(let selection of selectionToKeep) {
      this.treeControl.expand(selection);
    }
  }

  // function to kill all subscriptions if component is destroyed
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ------------------------------------------
   *  --------- Helper functions ---------------
      ------------------------------------------ */
  private checkForParentWithinSelection(id: string, parent: { mgId: string, root: boolean }): boolean {
    if(parent.root) {
      return id === parent.mgId;
    } else if(this.groups) {
      const group = this.getModuleGroup(parent.mgId, this.groups);
      if(group && group.parent) {
        return this.checkForParentWithinSelection(id, group.parent);
      }
    }
    return false;
  }
  

  private setAchievedEcts(
    groups: ModuleGroup[],
    completedModules: PathModule[]
  ): ModuleGroup[] {
    for (let group of groups) {
      let modules = completedModules.filter((el) => el.mgId == group.mgId);
      if (modules.length > 0) {
        group.achievedEcts = modules
          .map((el) => {
            if (el.status == 'passed') {
              return el.ects;
            }
            {
              return 0;
            }
          })
          .reduce((pv, cv) => pv + cv, 0);
      }
      if (group.children) {
        group.children = this.setAchievedEcts(group.children, completedModules);
        group.achievedEcts = group.children
          .map((el) => el.achievedEcts)
          .reduce((pv, cv) => Number(pv) + Number(cv), 0);
      }
    }
    return groups;
  }

  // Todo: Write Function that clears all achievedECTS
  private clearAchievedECTS(groups: ModuleGroup[]): ModuleGroup[] {
    for (let group of groups) {
      group.achievedEcts = 0;
      if (group.children) {
        group.children = this.clearAchievedECTS(group.children);
      }
    }
    return groups;
  }

  // function to add marked-node class to parents
  private checkForSelectionInStructure(group: ModuleGroup) {
    if (group.parent) {
      this.addMarkedClass(group.parent.mgId);
      if (!group.parent.root && this.groups) {
        const parent = this.findParentId(group.parent.mgId, this.groups);
        if (parent) {
          this.addMarkedClass(parent);
        }
      }
    }
  }

  // function to find parents of moduleGroups that are not the root nodes
  private findParentId(
    childId: string,
    groups: ModuleGroup[]
  ): string | undefined {
    for (let group of groups) {
      if (group.children && group.children.find((el) => el.mgId === childId)) {
        return group.mgId;
      } else if (group.children) {
        const foundId = this.findParentId(childId, group.children);
        if (foundId) {
          return foundId;
        }
      }
    }
    return undefined;
  }

  // function to add marked-node class to the given module group
  private addMarkedClass(mgId: string) {
    const element = document.getElementById(`${mgId}-node`);
    if (element) {
      element.classList.add('marked-node');
    }
  }

  // function to remove all marked-node classes -> reset selection
  private removeMarkedClass() {
    const elements = document.querySelectorAll('.marked-node');
    if (elements) {
      elements.forEach((el) => el.classList.remove('marked-node'));
    }
  }

  // function to iteratively get a module group out of a given array of module groups
  private getModuleGroup(
    mgId: string,
    groups: ModuleGroup[]
  ): ModuleGroup | undefined {
    let foundModuleGroup = undefined;
    for (let group of groups) {
      if (group.mgId === mgId) {
        foundModuleGroup = group;
        break;
      } else if (group.children) {
        foundModuleGroup = this.getModuleGroup(mgId, group.children);
        if (foundModuleGroup) {
          break;
        }
      }
    }
    return foundModuleGroup;
  }

  // function to set the filter depending on the current selected group
  private setOptionForFilter(group: ModuleGroup): Option {
    switch (this.selectedGroup) {
      case 'struktur':
        this.selectedGroupFilter = {
          // add group id as well as potential children id as value to find modules linked to children
          value: this.setFilterValueForModulegroup(group),
          name:
            group.fullName.endsWith('(Modulgruppe)') ||
            group.fullName.endsWith('(Fach)')
              ? group.name
              : group.fullName,
          key: 'mgId',
        };
        return this.selectedGroupFilter;
      case 'chair':
        this.selectedGroupFilter = {
          value: group.fullName,
          name: group.fullName,
          key: 'chair',
        };
        return this.selectedGroupFilter;
      default:
        this.selectedGroupFilter = {
          value: group.mgId,
          name: group.mgId,
          key: 'mgId',
        };
        return this.selectedGroupFilter;
    }
  }

  // helper function to set value of modulgroup filter
  private setFilterValueForModulegroup(group: ModuleGroup): string {
    if (group.children) {
      // if group has children set initial array containing mgId and then iteratively push ids of children
      let ids = [group.mgId];
      for (let child of group.children) {
        if (child.children) {
          ids.push(this.setFilterValueForModulegroup(child));
        } else {
          ids.push(child.mgId);
        }
      }
      return ids.join(' ');
    } else {
      // easy case, group has no children
      return group.mgId;
    }
  }
}
