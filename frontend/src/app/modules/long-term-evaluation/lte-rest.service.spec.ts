import { TestBed } from '@angular/core/testing';

import { LteRestService } from './lte-rest.service';

describe('LteRestService', () => {
  let service: LteRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LteRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
