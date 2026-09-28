import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { config } from 'src/environments/config.local';
import { LocaleService } from 'src/app/shared/services/locale.service';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class WelcomeComponent {
  private locale = inject(LocaleService);

  login() {
    // forward to login url if login button is clicked
    document.location.href = this.locale.localizeUrl(config.dashboardUrl);
  }
}
