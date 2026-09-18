import { Component, Input, SimpleChanges, inject } from '@angular/core';
import { MStudyProgramme, User } from '@interfaces/user';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { take } from 'rxjs';
import { config } from 'src/environments/config.local';
import { Router } from '@angular/router';
import { LocaleService } from 'src/app/shared/services/locale.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
  standalone: false,
})
export class ProfileMenuComponent {
  private auth = inject(AuthService);
  private locale = inject(LocaleService);
  router = inject(Router);

  @Input() user: User;
  bilappAvailable: boolean = false;

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
            document.location.href = this.locale.localizeUrl(config.homeUrl);
          }
        });
    }
  }

  login() {
    // forward to login url if login button is clicked
    document.location.href = this.locale.localizeUrl(config.dashboardUrl);
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
