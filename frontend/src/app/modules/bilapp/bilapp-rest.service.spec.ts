import { TestBed } from '@angular/core/testing';

import { BilappRestService } from './bilapp-rest.service';

describe('BilappRestService', () => {
  let service: BilappRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BilappRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
