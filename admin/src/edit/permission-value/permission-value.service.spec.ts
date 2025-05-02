import { TestBed } from '@angular/core/testing';

import { PermissionValueService } from './permission-value.service';

describe('PermissionEditService', () => {
  let service: PermissionValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
