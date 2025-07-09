import { TestBed } from '@angular/core/testing';

import { FieldValueService } from './field-value.service';

describe('FieldValueService', () => {
  let service: FieldValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
