import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ModuleOverviewEffects } from './module-overview.effects';

describe('ModuleOverviewEffects', () => {
  let actions$: Observable<any>;
  let effects: ModuleOverviewEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModuleOverviewEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ModuleOverviewEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
