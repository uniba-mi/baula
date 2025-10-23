import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap } from 'rxjs';
import { getNotInterestingModulesAcronyms, getUser } from 'src/app/selectors/user.selectors';
import { User } from '../../../../../../interfaces/user';
import { FormControl } from '@angular/forms';
import { Module } from '../../../../../../interfaces/module';
import { NotInterestingModulesActions, NotInterestingModuleActions } from 'src/app/actions/user.actions';
import { ModService } from 'src/app/shared/services/module.service';

@Component({
  selector: 'app-recs-settings',
  templateUrl: './recs-settings.component.html',
  styleUrl: './recs-settings.component.scss',
  standalone: false,
})
export class RecsSettingsComponent implements OnInit {
  user$: Observable<User>;
  interestsControl: FormControl = new FormControl(['']);
  interests$: Observable<string[]>;
  notInterestingModulesAcronyms$: Observable<string[]>;
  notInterestingModules$: Observable<Module[]>;

  constructor(
    private store: Store,
    private modService: ModService,
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.notInterestingModulesAcronyms$ = this.store.select(
      getNotInterestingModulesAcronyms
    );

    // fetch module details first
    this.getNotInterestingModules();
  }

  openModuleDetails(mod: Module) {
    this.modService.openDetailsDialog(mod);
  }

  getNotInterestingModules() {
    this.notInterestingModules$ = this.notInterestingModulesAcronyms$.pipe(
      switchMap((modIds) =>
        modIds.length > 0
          ? this.modService.getFullModulesByAcronyms(modIds)
          : of([])
      )
    );
  }

  deleteNotInterestingModules() {
    this.store.dispatch(
      NotInterestingModulesActions.deleteNotInterestingModules()
    );
  }

  deleteModule(event: any, acronym: string): void {
    event.stopPropagation();
    this.store.dispatch(
      NotInterestingModuleActions.deleteNotInterestingModule({
        acronym: acronym,
      })
    );
  }
}