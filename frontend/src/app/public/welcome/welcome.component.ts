import { Component } from '@angular/core';
import { config } from 'src/environments/config.local';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    standalone: false
})
export class WelcomeComponent {
  login() {
    // forward to login url if login button is clicked
    document.location.href = config.dashboardUrl;
  }
}
