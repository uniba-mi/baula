import { TestBed } from '@angular/core/testing';

import { RecsRestService } from './recs-rest.service';

describe('RecsRestService', () => {
  let service: RecsRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecsRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
