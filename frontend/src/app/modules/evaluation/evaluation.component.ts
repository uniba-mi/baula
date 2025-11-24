import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs';
import { EvaluationRestService } from './evaluation-rest.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { Evaluation, EvaluationJob, JobEvaluation, ModuleCandidate, Organisation, RankedModule } from '../../../../../interfaces/evaluation';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  standalone: false
})
export class EvaluationComponent implements OnInit {

  @ViewChild('descContainer', { static: false }) descContainer!: ElementRef;

  selectedOrga: Organisation;
  selectedSection: EvaluationJob | null = null;
  selectedSectionIndex: number;
  sections: EvaluationJob[] = [];
  candidates: ModuleCandidate[] = [];
  dropAreas: ModuleCandidate[][] = [];
  originalComment: string = '';
  comment: string = '';
  irrelevantItems: ModuleCandidate[] = [];
  allDropLists: string[] = [];

  progressValue: number = 0; // Progress bar
  moduleDataAvailable: boolean = true;
  completedSections: { [key: string]: boolean } = {};
  allAssigned: boolean = false;
  saveClicked: boolean = false;
  initialSelection: boolean = true;
  changesMade: boolean = false;
  isLoading: boolean = true;
  jobToggled: boolean = true;

  evaluationData: Evaluation | null = null;

  constructor(private api: EvaluationRestService, private evalRest: EvaluationRestService, private snackbar: SnackbarService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {

    // Get evaluation data per organsiation (e. g. chair)
    this.api.getOrganisationByCode().pipe(take(1)).subscribe((selectedOrga) => {
      if (selectedOrga) {
        this.selectedOrga = selectedOrga;
        this.evalRest.getEvaluationsBySpId(selectedOrga.id).pipe(take(1)).subscribe((evaluation) => {
          this.evaluationData = evaluation;

          this.sections = evaluation.jobEvaluations.map((jobEval: JobEvaluation) => jobEval.job);

          // For progress calculation and green highlighting
          this.initializeCompletedSections(evaluation.jobEvaluations);

          this.isLoading = false;
        });
      } else {
        this.router.navigate(['/app/evaluation']);
      }
    });
  }

  // Assuming that when there is data in the gold standard that it is completed (due to validation)
  initializeCompletedSections(jobEvaluations: JobEvaluation[]): void {
    let completedCount = 0;

    jobEvaluations.forEach(jobEval => { // Section is completed if it holds ranked modules
      if (jobEval.rankedModules && jobEval.rankedModules.length > 0) {
        this.completedSections[jobEval.job.jobId] = true;
        completedCount++;
      } else {
        this.completedSections[jobEval.job.jobId] = false;
      }
    });

    // Calculate progress percentage
    this.progressValue = jobEvaluations.length > 0 ? (completedCount / jobEvaluations.length) * 100 : 0;
  }

  setDropListConnections() {
    this.allDropLists = this.dropAreas.map((_, i) => `drop-list-${i}`);
    this.allDropLists.push('candidates-list', 'drop-list-irrelevant');
  }

  // Select and load module via tab click
  selectSection(section: EvaluationJob, index: number) {
    if (this.selectedSection) {

      const currentSectionComplete = this.completedSections[this.selectedSection.jobId] || false;

      // Check if changes have been made and not saved
      if (!this.initialSelection && this.moduleDataAvailable && !currentSectionComplete && !this.saveClicked) {
        this.snackbar.openSnackBar({
          type: AlertType.DANGER,
          message: 'Bitte ordnen Sie alle Module einem Feld zu und klicken Sie auf "Speichern", bevor Sie einen anderen Abschnitt auswählen.'
        });
        return;
      }

      // Check if changes have been made and not saved
      if (this.changesMade && this.moduleDataAvailable && !this.saveClicked) {
        this.snackbar.openSnackBar({
          type: AlertType.DANGER,
          message: 'Bitte speichern Sie Ihre Eingaben.'
        });
        return;
      }
    }

    this.initialSelection = false;
    this.selectedSection = section;
    this.selectedSectionIndex = index;
    this.saveClicked = false;
    this.loadJobEvaluation(section.jobId);
  }

  viewModule(content: any) {
    this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'evaluation',
        content: content,
      },
    });
  }

  loadJobEvaluation(jobId: string): void {
    if (!this.evaluationData) {
      this.moduleDataAvailable = false;
      return;
    }

    const jobEvaluation = this.evaluationData.jobEvaluations.find(je => je.job.jobId === jobId);

    if (!jobEvaluation) {
      this.moduleDataAvailable = false;
      return;
    }

    this.moduleDataAvailable = true;
    this.comment = jobEvaluation.comment || '';
    this.originalComment = jobEvaluation.comment || '';

    const allCandidates = jobEvaluation.candidates || [];

    const numberOfDropAreas = 10; // default 10, set dynamically according to length of candidates if needed

    this.dropAreas = Array.from({ length: numberOfDropAreas }, () => []);
    this.irrelevantItems = [];

    const rankedModules = jobEvaluation.rankedModules || [];

    const rankedAcronyms = rankedModules.map(rm => rm.acronym);

    this.candidates = allCandidates.filter(candidate =>
      !rankedAcronyms.includes(candidate.acronym)
    );

    rankedModules.forEach((rankedModule) => {
      const ranking = rankedModule.ranking;

      const candidateData = allCandidates.find(c => c.acronym === rankedModule.acronym);

      if (candidateData) {
        if (ranking === 100) { // Irrelevant ones have ranking 100
          this.irrelevantItems.push(candidateData);
        } else if (ranking >= 0 && ranking < numberOfDropAreas) {
          this.dropAreas[ranking].push(candidateData);
        }
      }
    });

    this.setDropListConnections();

    this.changesMade = false;
  }

  drop(event: CdkDragDrop<ModuleCandidate[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.changesMade = true;
  }

  onCommentChange() {
    if (this.comment !== this.originalComment) {
      this.changesMade = true;
    }
  }

  // Check if all candidates have been assigned to drop areas or irrelevant items
  isSaveEnabled(): boolean {
    this.allAssigned = this.candidates.length === 0;
    return this.allAssigned;
  }

  saveSelection() {
    if (!this.selectedSection || !this.selectedOrga) {
      return;
    }

    // Create ranked modules from drop areas
    const rankedModules = this.dropAreas.map((area, index) => {
      return area.map((item): RankedModule => ({
        acronym: item.acronym,
        name: item.name,
        content: item.content,
        skills: item.skills,
        chair: item.chair,
        ranking: index
      }));
    }).flat();

    const irrelevantRanked = this.irrelevantItems.map((item): RankedModule => ({
      acronym: item.acronym,
      name: item.name,
      content: item.content,
      skills: item.skills,
      chair: item.chair,
      ranking: 100
    }));

    const allRankedModules = [...rankedModules, ...irrelevantRanked];

    console.log('Saving evaluation for job:', this.selectedSection.jobId);
    console.log('Ranked modules:', allRankedModules);
    console.log('Comment:', this.comment);

    this.isLoading = true;

    this.evalRest.updateJobEvaluation(
      this.selectedOrga.id,
      this.selectedSection.jobId,
      allRankedModules,
      this.comment
    ).pipe(take(1)).subscribe({
      next: (response) => {
        this.snackbar.openSnackBar({
          type: AlertType.SUCCESS,
          message: "Zuordnung wurde gespeichert.",
        });

        // Update local data
        if (this.evaluationData && this.selectedSection) {
          const jobEvalIndex = this.evaluationData.jobEvaluations.findIndex(
            je => je.job.jobId === this.selectedSection!.jobId
          );

          if (jobEvalIndex !== -1) { // Update local eval data
            this.evaluationData.jobEvaluations[jobEvalIndex].rankedModules = allRankedModules;
            this.evaluationData.jobEvaluations[jobEvalIndex].comment = this.comment;
          }
        }

        this.completedSections[this.selectedSection!.jobId] = true;

        this.initializeCompletedSections(this.evaluationData!.jobEvaluations);

        this.saveClicked = true;
        this.changesMade = false;
        this.originalComment = this.comment;
        this.isLoading = false;
      },
      error: () => {
        this.snackbar.openSnackBar({
          type: AlertType.DANGER,
          message: "Zuordnung konnte nicht gespeichert werden.",
        });
        this.isLoading = false;
      }
    });

  }

  copyToClipboard(desc: string) {
    navigator.clipboard.writeText(desc).then(() => {
      this.snackbar.openSnackBar({
        type: AlertType.SUCCESS,
        message: 'Text in die Zwischenablage kopiert!',
      });
    });
  }

  openInNewTab(title: string): void {
    const content = this.descContainer.nativeElement.innerHTML;
    const newWindow = window.open('', '_blank');

    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert('Popup-Blocker aktiv? Neues Fenster konnte nicht geöffnet werden.');
    }
  }

  toggleJobDesc() {
    this.jobToggled = !this.jobToggled;
  }
}