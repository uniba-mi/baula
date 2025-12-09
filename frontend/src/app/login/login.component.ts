import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';
import { config } from 'src/environments/config.local';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    standalone: false
})
export class LoginComponent {
  username: string;
  password: string;
  errorMessage: string | undefined;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.localLogin(this.username, this.password)
  }

  shibLogin(): void {
    this.authService.shibLogin();
  }

  localLogin(username: string, password: string): void {
    this.authService.localLogin(username, password).subscribe(success => {
      if (success) {
        this.errorMessage = undefined;
        this.router.navigate(['/app/']);
      } else {
        this.errorMessage = 'Der Login ist fehlgeschlagen. Nutzername oder Passwort haben nicht gestimmt!';
      }
    });
  }

  demoLogin(): void {
    this.localLogin(config.demoUser, config.demoPassword)
  }
}
