import { Component, inject } from '@angular/core';
import { LteRestService } from '../lte-rest.service';
import { take } from 'rxjs';

@Component({
  selector: 'lte-result-page',
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss',
  providers: [
    LteRestService
  ]
})
export class ResultPageComponent {
  private api = inject(LteRestService);

  resetConsentResponse() {
    this.api.resetConsentResponse().pipe(take(1)).subscribe({
      next: (mes) => {
        console.log(mes)
      },
      error: (error) => {
        console.log(error)
      }
  })
  }
}
