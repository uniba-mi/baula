import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../../../interfaces/user';
import { Router } from '@angular/router';
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
  personalisationHint: string = 'personalisation-hint';
  personalisationMessage: string = 'Hier kannst du deine Präferenzen zur Personalisierung von Baula verwalten. Auf Basis deiner angegebenen Interessen oder Jobs werden dir dann für dich passende Module in der Empfehlungsseitenleiste im Bereich "Studienverlaufsplan" (Tab "Passend") angezeigt, sodass du sie direkt beim Planen verwenden kannst.'

  constructor(private router: Router, private store: Store) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    const lastEntry = this.router.url.split('/').pop();
    this.activeRoute = lastEntry ? lastEntry : '';
  }

  navigate(url: string) {
    this.activeRoute = url;
    this.router.navigate(['app', 'personalisierung', url]);
  }
}
