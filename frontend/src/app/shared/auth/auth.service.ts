import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { config } from 'src/environments/config.local';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  localLogin(username: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(
        `${config.loginUrl}local`,
        { username, password },
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((user) => {
          if (user) {
            return true;
          } else {
            return false;
          }
        }),
        catchError(() => of(false))
      );
  }

  shibLogin(): any {
    window.location.href = config.shibLoginUrl;
  }

  localLogout(): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(
        config.localLogoutUrl,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => {
          return response.success;
        }),
        catchError(() => of(false))
      );
  }

  shibLogout(): Observable<{ success: boolean; requestUrl?: string }> {
    return this.http
      .get<{ success: boolean; requestUrl?: string }>(config.shibLogoutUrl)
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(() => of({ success: false }))
      );
  }

  isAuthenticated(): Observable<boolean> {
    return this.http
      .get<{ user: { shibId: string; roles: string[]; authType: string } }>(
        `${config.apiUrl}`
      )
      .pipe(
        map((response) => {
          if (response.user) {
            return true;
          } else {
            return false;
          }
        }),
        catchError(() => of(false))
      );
  }

  forceReload(error: any): void {
    if(error.status && (error.status === 401 || error.status === 0)) {
      this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Bitte Seite neu laden!',
          dialogContentId: 'force-reload',
        },
        minWidth: '80vw',
        disableClose: true,
      }).afterClosed().subscribe(() => {
        window.location.reload();
      });
    }
  }
}
