import { TestBed } from '@angular/core/testing';

import { BilappGuard } from './bilapp-guard';

describe('BilappGuardService', () => {
  let service: BilappGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BilappGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
