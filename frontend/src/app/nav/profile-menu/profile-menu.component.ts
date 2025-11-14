import { Component, Input, SimpleChanges } from '@angular/core';
import { MStudyProgramme, User } from '../../../../../interfaces/user';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { take } from 'rxjs';
import { config } from 'src/environments/config.local';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
  standalone: false,
})
export class ProfileMenuComponent {
  @Input() user: User;
  bilappAvailable: boolean = false;

  constructor(private auth: AuthService, public router: Router) {}

  logout() {
    if (this.user.authType === 'saml') {
      // forward to logout url if logout button is clicked
      this.auth
        .shibLogout()
        .pipe(take(1))
        .subscribe((serverResponse) => {
          if (serverResponse && serverResponse.requestUrl) {
            document.location.href = serverResponse.requestUrl;
          }
        });
    } else {
      // forward to logout url if logout button is clicked
      this.auth
        .localLogout()
        .pipe(take(1))
        .subscribe((success) => {
          if (success) {
            document.location.href = config.homeUrl;
          }
        });
    }
  }

  login() {
    // forward to login url if login button is clicked
    document.location.href = config.dashboardUrl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && this.user.sps) {
      this.bilappAvailable = this.checkStudyprogramme(this.user.sps);
    }
  }

  checkStudyprogramme(sps: MStudyProgramme[]): boolean {
    for (let sp of sps) {
      // assumption that teacher education sps start with LA and if EWS part is referenced ends with EWS
      if (sp.spId.startsWith('LA') && sp.spId.endsWith('EWS')) {
        return true;
      }
    }
    return false;
  }
}
