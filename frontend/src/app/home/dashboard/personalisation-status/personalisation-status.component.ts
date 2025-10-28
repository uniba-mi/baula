import { Component, EventEmitter, Output } from '@angular/core';
import { combineLatest, map, Observable, switchMap, take } from 'rxjs';
import { ExtendedJob } from '../../../../../../interfaces/job';
import { Module } from '../../../../../../interfaces/module';
import { Store } from '@ngrx/store';
import { getFavouriteModuleAcronyms, getJobs, getUserTopics } from 'src/app/selectors/user.selectors';
import { ModService } from 'src/app/shared/services/module.service';

@Component({
  selector: 'app-personalisation-status',
  standalone: false,
  templateUrl: './personalisation-status.component.html',
  styleUrl: './personalisation-status.component.scss'
})

export class PersonalisationStatusComponent {

  @Output() allComplete = new EventEmitter<boolean>();

  private topics$: Observable<string[]>
  private jobs$: Observable<ExtendedJob[] | undefined>
  private favouriteModules$: Observable<Module[]>;

  steps: {
    title: string;
    description: string;
    icon: string;
    link: string;
    completed$?: Observable<boolean>;
  }[] = [
      {
        title: 'Interessen',
        description: 'Gib 3 Interessen an',
        icon: 'bi bi-tag-fill',
        link: '/app/personalisierung/topics',
      },
      {
        title: 'Jobs',
        description: 'Lege einen Job an',
        icon: 'bi bi-signpost-split-fill',
        link: '/app/personalisierung/jobs',
      },
      {
        title: 'Merkliste',
        description: 'Markiere 3 Module als gemerkt',
        icon: 'bi bi-bookmark-fill',
        link: '/app/personalisierung/merkliste',
      }
    ];

  get allStepsCompleted$(): Observable<boolean> {
    return combineLatest(this.steps.map(s => s.completed$!)).pipe(
      map(results => results.every(r => r))
    );
  }

  constructor(private store: Store, private modService: ModService) { }

  ngOnInit() {

    // load data for steps
    this.topics$ = this.store.select(getUserTopics)
    this.jobs$ = this.store.select(getJobs);
    this.favouriteModules$ = this.store.select(getFavouriteModuleAcronyms).pipe(
      take(1),
      switchMap((favouriteAcronyms: string[]) =>
        this.modService.getFullModulesByAcronyms(favouriteAcronyms)
      )
    );

    this.markStepsAsCompleted();

    // for parent who displays success
    this.allStepsCompleted$.subscribe(isComplete => {
      this.allComplete.emit(isComplete);
    });
  }

  markStepsAsCompleted() {
    this.steps[0].completed$ = this.topics$.pipe(map(topics => (topics?.length ?? 0) >= 3));
    this.steps[1].completed$ = this.jobs$.pipe(map(jobs => (jobs?.length ?? 0) > 0));
    this.steps[2].completed$ = this.favouriteModules$.pipe(map(modules => (modules?.length ?? 0) >= 3));
  }
}
