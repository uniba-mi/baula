import { TestBed } from '@angular/core/testing';

import { RecsTabService } from './recs-tab.service';

describe('RecsTabService', () => {
  let service: RecsTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecsTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
