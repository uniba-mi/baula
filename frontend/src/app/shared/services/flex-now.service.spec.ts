import { TestBed } from '@angular/core/testing';

import { FlexnowService } from './flex-now.service';

describe('FlexnowService', () => {
  let service: FlexnowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlexnowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
