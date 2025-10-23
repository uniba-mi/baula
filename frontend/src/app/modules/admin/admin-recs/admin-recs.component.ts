import { Component } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';

@Component({
  selector: 'admin-recs',
  standalone: false,
  templateUrl: './admin-recs.component.html',
  styleUrl: './admin-recs.component.scss'
})
export class AdminRecsComponent {

  constructor(private adminService: AdminRestService) {

  }

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
}
