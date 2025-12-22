import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemActionName, MetaSemester } from '../../../../../../../../../interfaces/semester-plan';
import { StudyPath } from '../../../../../../../../../interfaces/study-path';
import { getUserStudyPath, isModuleInStudyPath } from 'src/app/selectors/user.selectors';
import { map, Observable, of, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { ExtendedModuleGroup } from '../../../../../../../../../interfaces/module-group';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';

interface ActionConfig {
  icon: string;
  text: string;
  showInMenu: boolean;
}

@Component({
  selector: 'app-semester-card',
  templateUrl: './semester-card.component.html',
  styleUrl: './semester-card.component.scss',
  standalone: false,
})

export class SemesterCardComponent {
  @Input() metaSemester: MetaSemester;
  @Input() moduleData: any;
  @Input() moduleType: 'module' | 'userGeneratedModule' | 'pathModule';
  @Input() modType: string;
  @Input() isSmallScreen: boolean;
  @Input() availableActions: ItemActionName[] = []; // available for card type

  @Output() actionTriggered = new EventEmitter<{ action: ItemActionName, data: any }>();

  openedWithSemesterSet: boolean = true;
  studyPath$: Observable<StudyPath>;
  isDragging: boolean = false;
  moduleInStudyPath$: Observable<boolean>;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;

  actionConfig: Record<ItemActionName, ActionConfig> = {
    'feedback': { icon: 'bi-chat-dots', text: 'Feedback', showInMenu: true },
    'edit': { icon: 'bi-pencil', text: 'Bearbeiten', showInMenu: true },
    'delete': { icon: 'bi-trash3', text: 'Löschen', showInMenu: true },
    'changeMG': { icon: 'bi-pencil', text: 'Modulgruppe bearbeiten', showInMenu: false },
    'editGrade': { icon: 'bi-pencil', text: 'Note bearbeiten', showInMenu: false },
    'select': { icon: 'bi-cursor', text: 'Auswählen', showInMenu: false },
    'drag': { icon: 'bi-arrows-move', text: 'Verschieben', showInMenu: false },
    'moveToSem': { icon: 'bi-arrows-move', text: 'Verschieben', showInMenu: true }
  };

  constructor(
    private store: Store,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {

    this.studyPath$ = this.store.select(getUserStudyPath);

    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);

    // for conditional displayal of feedback
    this.moduleInStudyPath$ = this.store.select(isModuleInStudyPath(this.moduleData.acronym));
  }

  canDrag(): boolean {
    const isOldModule = this.moduleType === 'module' && this.moduleData?.isOld;
    const canDragResult = this.availableActions.includes('drag') &&
      !this.isSmallScreen &&
      this.moduleType !== 'pathModule' &&
      !isOldModule &&
      !this.metaSemester.isPastSemester;

    return canDragResult;
  }

  onDragStarted() {
    this.isDragging = true;
  }

  onDragEnded() {
    this.isDragging = false;
  }

  getModulePath(mgId: string | undefined): Observable<string | null> {
    if (!mgId) {
      return of(null);
    }
    return this.structuredModuleGroups$.pipe(
      map(groups => {
        const group = groups.find(g => g.mgId === mgId);
        if (group) {
          return group.path;
        } else {
          return null;
        }
      })
    );
  }

  triggerAction(action: ItemActionName, data?: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // select is not triggered when user is dragging stuff
    if (action === 'select' && this.isDragging) {
      return;
    }

    this.actionTriggered.emit({
      action: action,
      data: data || this.moduleData
    });
  }

  // actions for context menu
  get menuActions(): ItemActionName[] {
    return this.availableActions.filter(action => this.actionConfig[action].showInMenu);
  }

  // make sure hint is displayed to users if they drag an old module
  onDragAttempt(event: Event): void {
    if (this.moduleType === 'module' && this.moduleData?.isOld && this.availableActions.includes('drag')) {
      this.snackbarService.openSnackBar({
        message: 'Dieses Modul ist nicht mehr in der aktuellen Version vorhanden und kann nicht verschoben oder angesehen werden. Wenn du es entfernen möchtest, kannst du es löschen oder stattdessen einen Platzhalter anlegen.',
        type: AlertType.DANGER,
      });
    }
  }

  // availability of action
  canShowAction(action: ItemActionName): boolean {
    if (!this.availableActions.includes(action)) return false;

    // do not show drag action in context menu for past semesters
    if (action === 'drag' && this.metaSemester.isPastSemester) {
      return false;
    }

    let moduleInStudyPath = false;
    this.moduleInStudyPath$.pipe(take(1)).subscribe(inPath => {
      moduleInStudyPath = inPath;
    });

    switch (action) {
      case 'feedback':
        return (
          ((this.moduleType === 'module' && !this.moduleData.isOld) ||
            (this.moduleType === 'pathModule' && !this.moduleData.isUserGenerated)) &&
          moduleInStudyPath
        );
      case 'edit':
        return this.moduleType === 'userGeneratedModule' ||
          (this.moduleType === 'pathModule' && this.moduleData.isUserGenerated);
      case 'select':
      case 'drag':
        return this.moduleType === 'module' && !('isOld' in this.moduleData && this.moduleData.isOld);
      case 'moveToSem':
        return this.moduleType !== 'pathModule' && !('isOld' in this.moduleData && this.moduleData.isOld);
      default:
        return true;
    }
  }
}