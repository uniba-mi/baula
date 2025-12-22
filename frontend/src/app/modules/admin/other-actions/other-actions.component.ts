import { Component, inject } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { take } from 'rxjs';

@Component({
  selector: 'other-actions',
  standalone: false,
  templateUrl: './other-actions.component.html',
  styleUrl: './other-actions.component.scss'
})
export class OtherActionsComponent {

  private api = inject(AdminRestService);

  triggerError() {
    throw new Error("Testfehler für Sentry :)");
  }

  resetNotificationHint() {
    this.api
      .resetNotificationHint()
      .pipe(take(1))
      .subscribe({
        next: (mes) => {
          console.log(mes);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}