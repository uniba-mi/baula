import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { RecsRestService } from 'src/app/modules/recommendations/recs-rest.service';
import { getJobs, getUserTopics, getExcludedModulesAcronyms } from 'src/app/selectors/user.selectors';
import { ExtendedJob } from '../../../../../../interfaces/job';
import { Topic } from '../../../../../../interfaces/topic';
import { ModService } from 'src/app/shared/services/module.service';

@Component({
  selector: 'app-data-preview',
  standalone: false,
  templateUrl: './data-preview.component.html',
  styleUrl: './data-preview.component.scss'
})
export class DataPreviewComponent {

  @Input() type: 'jobs' | 'topics';

  jobs$: Observable<ExtendedJob[]>;
  topics$: Observable<Topic[]>;
  displayItems$: Observable<any[]>;
  jobKeywords$: Observable<string[]>;
  topicKeywords$: Observable<string[]>;
  recommendedAcronyms$: Observable<string[]>;

  constructor(private store: Store, private recsService: RecsRestService, private modService: ModService) { }


  ngOnInit() {

    this.jobs$ = this.store.select(getJobs).pipe(
      map(jobs => jobs || [])
    );

    this.topics$ = combineLatest([
      this.store.select(getUserTopics),
      this.recsService.getTopicChildren()
    ]).pipe(
      map(([userTopicIds, allTopics]) =>
        allTopics?.filter(topic => userTopicIds?.includes(topic.tId)) || []
      )
    );

    this.recommendedAcronyms$ = combineLatest([
      this.recsService.getPersonalRecommendations(),
      this.store.select(getExcludedModulesAcronyms)
    ]).pipe(
      map(([recs, blacklist]) => {
        if (!recs || recs.length === 0) return [];

        const recommendations = recs[0].recommendedMods || [];
        const targetType = this.type === 'jobs' ? 'job' : 'topic';
        const acronyms: string[] = [];

        recommendations.forEach(mod => {

          if (blacklist.includes(mod.acronym)) return;

          const matchingSourcesCount = mod.source?.filter((src: any) => src.type === targetType).length || 0;

          for (let i = 0; i < matchingSourcesCount; i++) {
            acronyms.push(mod.acronym);
          }
        });

        return acronyms.sort(() => Math.random() - 0.5);
      })
    );

    this.displayItems$ = this.type === 'jobs' ? this.jobs$ : this.topics$;
  }

  get title(): string {
    return this.type === 'jobs' ? 'Jobs' : 'Interessen';
  }

  get routeLink(): string {
    return `/app/personalisierung/${this.type}`;
  }

  getItemName(item: any): string {
    return item.name || item.title || '';
  }

  get tooltipText(): string {
    const label = this.type === 'jobs' ? 'Jobs' : 'Themen';
    return `Module, die dir auf Basis deiner angegebenen ${label} empfohlen werden.`;
  }

  onModuleClick(acronym: string): void {
    this.modService.selectModuleFromAcronymString(acronym);
  }
}
