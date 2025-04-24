import { TestBed } from '@angular/core/testing';

import { FlagValueService } from './flag-value.service';

describe('FlagValueService', () => {
  let service: FlagValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlagValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
