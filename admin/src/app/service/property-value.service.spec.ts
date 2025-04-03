import { TestBed } from '@angular/core/testing';

import { PropertyValueService } from './property-value.service';

describe('PropertyValueService', () => {
  let service: PropertyValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
