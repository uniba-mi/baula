import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { advisorGuard } from './advisor.guard';

describe('advisorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => advisorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
