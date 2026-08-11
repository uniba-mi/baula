import { Component, inject } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { EvaluationRestService } from '../../evaluation/evaluation-rest.service';

@Component({
  selector: 'admin-recs',
  standalone: false,
  templateUrl: './admin-recs.component.html',
  styleUrl: './admin-recs.component.scss',
})
export class AdminRecsComponent {
  private adminService = inject(AdminRestService);
  private evalService = inject(EvaluationRestService);

  getModuleEmbeddings() {
    this.adminService.updateModuleEmbeddings().subscribe({
      next: (response) => {
        console.log($localize `Modulembeddings wurden aktualisiert`, response);
      },
      error: (error) => {
        console.error(
          $localize `Modulembeddings konnten nicht aktualisiert werden`,
          error,
        );
      },
    });
  }

  getTopics() {
    this.adminService.initializeTopics().subscribe({
      next: (response) => {
        console.log($localize `Topics wurden initialisiert`, response);
      },
      error: (error) => {
        console.error($localize `Topics konnten nicht initialisiert werden`, error);
      },
    });
  }

  initEvaluationData() {
    this.evalService.initEvaluationData().subscribe({
      next: (response) => {
        console.log($localize `Evaluationsdaten wurden initialisiert`, response);
      },
      error: (error) => {
        console.error(
          $localize `Evaluationsdaten konnten nicht initialisiert werden`,
          error,
        );
      },
    });
  }
}
