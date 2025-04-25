import { TestBed } from '@angular/core/testing';

import { AttributeValueService } from './attribute-value.service';

describe('PropertyValueService', () => {
  let service: AttributeValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributeValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
