import { TestBed } from '@angular/core/testing';

import { RecTabService } from './rec-tab.service';

describe('RecTabService', () => {
  let service: RecTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
