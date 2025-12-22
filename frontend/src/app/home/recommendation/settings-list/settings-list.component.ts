import { Component, Input } from '@angular/core';
import { delay, map, Observable, of, switchMap, take } from 'rxjs';
import { FavoriteModulesActions, ExcludedModuleActions, UserActions } from 'src/app/actions/user.actions';
import { getAllModuleFeedback, getFavouriteModuleAcronyms, getExcludedModulesAcronyms, getUser } from 'src/app/selectors/user.selectors';
import { Module } from '../../../../../../interfaces/module';
import { ModuleFeedback, User } from '../../../../../../interfaces/user';
import { ModService } from 'src/app/shared/services/module.service';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Recommendation } from '../../../../../../interfaces/recommendation';
import { RecsRestService } from 'src/app/modules/recommendations/recs-rest.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

type ListItem = ModuleFeedback | Module

@Component({
  selector: 'app-settings-list',
  standalone: false,
  templateUrl: './settings-list.component.html',
  styleUrl: './settings-list.component.scss'
})
export class SettingsListComponent {

  @Input() preview: boolean = false;
  @Input() type: 'blacklist' | 'merkliste' | 'feedback';

  user$: Observable<User>;

  // data
  blacklistItems$: Observable<Module[]>;
  favouriteItems$: Observable<Module[]>;
  feedbackItems$: Observable<ModuleFeedback[]>;
  recommendations$: Observable<Recommendation[]>;

  constructor(private store: Store, private modService: ModService, private recsService: RecsRestService, private route: ActivatedRoute, private dialog: MatDialog,
  ) { }

  ngOnInit() {

    if (!this.preview) {
      // get type from route data
      this.type = this.route.snapshot.data['type'] || 'merkliste';
    }

    this.user$ = this.store.select(getUser);
    this.recommendations$ = this.recsService.getPersonalRecommendations();

    this.loadData();
  }

  get routeLink(): string {
    return `/app/personalisierung/${this.type}`;
  }

  private loadData(): void {

    // get blacklist modules
    this.blacklistItems$ = this.store.select(getExcludedModulesAcronyms).pipe(
      switchMap((modIds: string[]) =>
        modIds.length > 0
          ? this.modService.getFullModulesByAcronyms(modIds)
          : of([])
      )
    );

    // get favourite modules
    this.favouriteItems$ = this.store.pipe(select(getFavouriteModuleAcronyms),
      switchMap((favouriteAcronyms: string[]) =>
        favouriteAcronyms.length > 0
          ? this.modService.getFullModulesByAcronyms(favouriteAcronyms)
          : of([])
      )
    )

    this.feedbackItems$ = this.store.select(getAllModuleFeedback);
  }

  getCurrentItems$(): Observable<ListItem[]> {
    switch (this.type) {
      case 'merkliste':
        return this.favouriteItems$;
      case 'blacklist':
        return this.blacklistItems$;
      case 'feedback':
        return this.feedbackItems$.pipe(
          switchMap(feedbackItems =>
            this.store.select(getExcludedModulesAcronyms).pipe(
              map(blacklistAcronyms =>
                feedbackItems.filter(feedback =>
                  !blacklistAcronyms.includes(feedback.acronym)
                )
              )
            )
          )
        );
      default:
        return of([]);
    }
  }

  getTitle(): string {
    const titles = {
      preview: {
        merkliste: 'Merkliste',
        blacklist: 'Blacklist',
        feedback: 'Feedback'
      },
      standard: {
        merkliste: 'Alle Module auf deiner Merkliste',
        blacklist: 'Alle Module auf deiner Blacklist',
        feedback: 'Module, zu denen du positives Feedback gegeben hast.'
      }
    };

    return this.preview ? titles.preview[this.type] : titles.standard[this.type];
  }

  get tooltipText(): string {
    switch (this.type) {
      case 'merkliste':
        return 'Module, die du für später speichern möchtest.';
      case 'blacklist':
        return 'Module, die du aus deinen Empfehlungen ausschließen möchtest.';
      case 'feedback':
        return 'Dein abgegebenes Feedback zu Modulen.';
      default:
        return '';
    }
  }

  deleteItem(item: ListItem): void {
    switch (this.type) {
      case 'blacklist':
        const blacklistItem = item as Module;
        this.store.dispatch(
          ExcludedModuleActions.deleteExcludedModule({
            acronym: blacklistItem.acronym
          })
        );
        break;
      case 'merkliste':
        const favouriteItem = item as Module;
        this.store.dispatch(
          FavoriteModulesActions.toggleFavouriteModule({
            acronym: favouriteItem.acronym
          })
        );
        break;
      case 'feedback':

        const feedbackItem = item as ModuleFeedback;

        const confirmationDialogInterface: ConfirmationDialogData = {
          dialogTitle: 'Feedback zum Modul löschen?',
          actionType: 'delete',
          confirmationItem: `dein Feedback zum Modul "${feedbackItem.acronym}"`,
          confirmButtonLabel: 'Löschen',
          cancelButtonLabel: 'Abbrechen',
          confirmButtonClass: 'btn btn-danger',
          callbackMethod: () => {
            this.deleteFeedback(feedbackItem.acronym);
          },
        };

        this.dialog.open(ConfirmationDialogComponent, {
          data: confirmationDialogInterface,
        });

        break;
    }
  }

  getFeedbackChipClass(score: number): string {
    if (score < 1.0) {
      return 'feedback-chip-light';
    }
    return 'feedback-chip';
  }

  getFeedbackIcon(score: number): string {
    if (score === 1.0) {
      return 'bi-emoji-heart-eyes'; // 5 stars
    }
    return 'bi-emoji-laughing'; // 4 stars
  }

  deleteFeedback(acronym: string) {
    console.log('deleting', acronym)

    // delete from feedback in user (and personal recommendation via effect)
    this.store.dispatch(
      UserActions.deleteModuleFeedback({
        moduleFeedback: { acronym }
      })
    );
    this.dialog.closeAll();
  }

  editFeedback(item: ModuleFeedback): void {
    this.modService.selectModuleFromAcronymString(item.acronym, 'feedback');

    this.dialog.afterAllClosed.pipe(
      take(1),
      delay(500)
    ).subscribe(() => {
      this.recommendations$ = this.recsService.getPersonalRecommendations();
    });
  }

  isModule(item: ListItem): item is Module {
    return 'acronym' in item;
  }

  isFeedback(item: ListItem): item is ModuleFeedback {
    return 'id' in item && !('acronym' in item);
  }

  getItemAcronym(item: ListItem): string {
    return item.acronym;
  }

  getItemName(item: ListItem): string {
    if (this.isModule(item)) {
      return item.name;
    } else if (this.isFeedback(item)) {
      const feedback = item as any;
      return `Feedback zu ${feedback.acronym}` || 'Feedback';
    }
    return '';
  }

  getRecommendedModulesForFeedback(
    feedbackAcronym: string,
    recommendations: Recommendation[]
  ): Array<{ acronym: string; score: number }> {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    const userRec = recommendations[0];

    if (!userRec || !userRec.recommendedMods) {
      return [];
    }

    return userRec.recommendedMods
      .filter(recMod =>
        recMod.source?.some(
          source => source.type === 'feedback_similarmods' && source.identifier === feedbackAcronym
        )
      )
      .map(recMod => {
        const feedbackSource = recMod.source?.find(
          source => source.type === 'feedback_similarmods' && source.identifier === feedbackAcronym
        );
        return {
          acronym: recMod.acronym,
          score: feedbackSource?.score || 0
        };
      });
  }

  get noDataMessage(): string {
    switch (this.type) {
      case 'merkliste':
        return 'Klicke im Dreipunktmenü der empfohlenenen Modulkarten auf "Merken", damit hier Module angezeigt werden.';
      case 'blacklist':
        return 'Klicke im Dreipunktmenü der empfohlenenen Modulkarten auf "Nicht mehr vorschlagen", damit hier Module angezeigt werden.';
      case 'feedback':
        return 'Nachdem du ein Modul abgeschlossen hast, kannst du über die Moduldetails (Tab Feedback) Feedback geben. Wenn es Modulempfehlungen dazu gibt, werden diese hier angezeigt.';
      default:
        return 'Keine Daten vorhanden.';
    }
  }
}