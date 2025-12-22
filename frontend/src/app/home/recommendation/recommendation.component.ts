import { Component, OnInit } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { User } from '../../../../../interfaces/user';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { getUser } from 'src/app/selectors/user.selectors';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrl: './recommendation.component.scss',
  standalone: false,
})
export class RecommendationComponent implements OnInit {
  user$: Observable<User>;
  activeRoute: string;
  hasRecommendations = false
  personalisationHint: string = 'personalisation-hint';
  personalisationMessage: string = 'Hier kannst du deine Präferenzen zur Personalisierung von Baula verwalten. Auf Basis deiner angegebenen Interessen oder Jobs werden dir dann für dich passende Module in der Empfehlungsseitenleiste im Bereich "Studienverlaufsplan" (Tab "Passend") angezeigt, sodass du sie direkt beim Planen verwenden kannst.'

  constructor(private router: Router, private store: Store) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.updateActiveRoute();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateActiveRoute());
  }

  private updateActiveRoute(): void {
    const url = this.router.url;
    const lastSegment = url.split('/').pop();
    this.activeRoute = (lastSegment === 'personalisierung') ? '' : lastSegment || '';
  }

  navigate(url: string): void {
    this.router.navigate(url === '' ? ['/app/personalisierung'] : ['/app/personalisierung', url]);
  }
}
