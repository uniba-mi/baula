import { Component } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { EvaluationRestService } from '../../evaluation/evaluation-rest.service';

@Component({
  selector: 'admin-recs',
  standalone: false,
  templateUrl: './admin-recs.component.html',
  styleUrl: './admin-recs.component.scss'
})
export class AdminRecsComponent {

  constructor(private adminService: AdminRestService, private evalService: EvaluationRestService) { }

  getModuleEmbeddings() {
    this.adminService.updateModuleEmbeddings().subscribe({
      next: (response) => {
        console.log('Modulembeddings wurden aktualisiert', response);
      },
      error: (error) => {
        console.error('Modulembeddings konnten nicht aktualisiert werden', error);
      }
    });
  }

  getTopics() {
    this.adminService.initializeTopics().subscribe({
      next: (response) => {
        console.log('Topics wurden initialisiert', response);
      },
      error: (error) => {
        console.error('Topics konnten nicht initialisiert werden', error);
      }
    });
  }

  initEvaluationData() {
    this.evalService.initEvaluationData().subscribe({
      next: (response) => {
        console.log('Evaluationsdaten wurden initialisiert', response);
      },
      error: (error) => {
        console.error('Evaluationsdaten konnten nicht initialisiert werden', error);
      }
    });
  }
}
