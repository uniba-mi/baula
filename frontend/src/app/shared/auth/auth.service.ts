import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { config } from 'src/environments/config.local';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { LocaleService } from 'src/app/shared/services/locale.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private locale = inject(LocaleService);

  /** Passes the locale through the IdP as RelayState, which mirrors it back unchanged */
  private withRelayState(url: string): string {
    if (!this.locale.hasLocalePrefix) {
      return url;
    }
    const target = new URL(url);
    target.searchParams.set('RelayState', this.locale.current);
    return target.toString();
  }

  localLogin(username: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(
        `${config.loginUrl}local`,
        { username, password },
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((user) => {
          if (user) {
            return true;
          } else {
            return false;
          }
        }),
        catchError(() => of(false)),
      );
  }

  shibLogin(): any {
    window.location.href = this.withRelayState(config.shibLoginUrl);
  }

  localLogout(): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(
        config.localLogoutUrl,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => {
          return response.success;
        }),
        catchError(() => of(false)),
      );
  }

  shibLogout(): Observable<{ success: boolean; requestUrl?: string }> {
    return this.http
      .get<{
        success: boolean;
        requestUrl?: string;
      }>(this.withRelayState(config.shibLogoutUrl))
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(() => of({ success: false })),
      );
  }

  isAuthenticated(): Observable<boolean> {
    return this.http
      .get<{
        user: { shibId: string; roles: string[]; authType: string };
      }>(`${config.apiUrl}`)
      .pipe(
        map((response) => {
          if (response.user) {
            return true;
          } else {
            return false;
          }
        }),
        catchError(() => of(false)),
      );
  }

  forceReload(error: any): void {
    if (error.status && (error.status === 401 || error.status === 0)) {
      this.dialog
        .open(DialogComponent, {
          data: {
            dialogTitle: 'Bitte Seite neu laden!',
            dialogContentId: 'force-reload',
          },
          minWidth: '80vw',
          disableClose: true,
        })
        .afterClosed()
        .subscribe(() => {
          window.location.reload();
        });
    }
  }
}
