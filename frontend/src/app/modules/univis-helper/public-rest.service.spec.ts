import { TestBed } from '@angular/core/testing';

import { PublicRestService } from './public-rest.service';

describe('PublicRestService', () => {
  let service: PublicRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
