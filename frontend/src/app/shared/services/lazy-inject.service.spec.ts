import { TestBed } from '@angular/core/testing';

import { LazyInjectService } from './lazy-inject.service';

describe('LazyInjectService', () => {
  let service: LazyInjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LazyInjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
