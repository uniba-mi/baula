import { Component, Input, OnInit } from '@angular/core';
import { ExtendedJob, Job, Jobtemplate } from '../../../../../interfaces/job';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, take } from 'rxjs';
import { MockJob, mockJobs } from './mocked-jobs';
import { Store } from '@ngrx/store';
import { getJobs } from 'src/app/selectors/user.selectors';
import { RecsRestService } from 'src/app/modules/recommendations/recs-rest.service';

@Component({
  selector: 'app-edit-job-dialog',
  templateUrl: './edit-job-dialog.component.html',
  styleUrl: './edit-job-dialog.component.scss',
  standalone: false,
})
export class EditJobDialogComponent implements OnInit {
  @Input() job: Job | Jobtemplate | undefined;
  jobs$: Observable<ExtendedJob[] | undefined>;
  inputMode: 'url' | 'mock' | undefined;
  mockedJobs: MockJob[] = mockJobs;
  selectedJob: MockJob | undefined;
  editedJob: Job | Jobtemplate |undefined;
  searchUrl: string;
  loading = false;
  loadingKeywords = false;
  editMode: boolean;
  errorMessage: string;
  existingJobMap: Map<string, boolean> = new Map();
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(private recsService: RecsRestService, private store: Store) { }

  ngOnInit() {
    this.jobs$ = this.store.select(getJobs);

    // Berechnung der deaktivierten Optionen
    this.jobs$.pipe(take(1)).subscribe((jobs) => {
      if (jobs) {
        this.mockedJobs.forEach((mockJob) => {
          const exists = jobs.some(
            (job) =>
              job.title === mockJob.title
          );
          this.existingJobMap.set(mockJob.title, exists);
        });
      }
    });

    this.editMode = this.job && Object.keys(this.job).includes('_id') ? true : false; 
    this.editedJob = this.job ? JSON.parse(JSON.stringify(this.job)) : undefined;

    // Mock input mode until url is disabled
    this.inputMode = 'mock'
  }

  crawlJob() {
    if(this.searchUrl) {
      this.loading = true;
      this.editedJob = undefined;
      this.recsService.crawlJob(this.searchUrl).pipe(take(1)).subscribe((value: any) => {
        if(!value) {
          this.errorMessage = "Die Jobanzeige konnte leider nicht geladen werden."
        } else {
          this.editedJob = {
            title: value.title,
            description: value.description,
            inputMode: this.inputMode || 'url',
            keywords: value.keywords || []
          }
        }
        this.loading = false;
      });
    }
  }

  clearInput() {
    this.searchUrl = '';
  }

  addKeyword(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    if (value && this.editedJob) {
      this.editedJob.keywords.push(value)
    }

    event.chipInput!.clear();
  }

  generateKeywords() {
    if(this.editedJob && this.editedJob.title && this.editedJob.description) {
      this.loadingKeywords = true;
      this.editedJob.keywords = [];
      this.recsService.generateJobKeywords(this.editedJob).pipe(take(1)).subscribe((value: any) => {
        if(this.editedJob && value && value.keywords) {
          this.editedJob.keywords = value.keywords;
        } else {
          this.errorMessage = "Die Keywords konnten leider nicht generiert werden.";
        }
        this.loadingKeywords = false;
      });
    }
  }

  removeKeyword(index: number) {
    if(this.editedJob && this.editedJob.keywords[index]) {
      this.editedJob.keywords.splice(index, 1);
    }
  }

  selectJob() {
    if(this.selectedJob) {
      this.editedJob = {
        title: this.selectedJob.title,
        description: `${this.selectedJob.description}\n${this.selectedJob.requirements.map(req => `- ${req}`).join('\n')}`,
        inputMode: this.inputMode || 'mock',
        keywords: this.selectedJob.keywords
      }
    }
  }

  selectInputMode(mode: 'url' | 'mock') {
    // Reset to start values
    this.editedJob = undefined;
    this.selectedJob = undefined;

    // Set input mode
    this.inputMode = mode;
  }
}
