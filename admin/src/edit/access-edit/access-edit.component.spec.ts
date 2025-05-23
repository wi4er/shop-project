import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessEditComponent } from './access-edit.component';

describe('GroupPermissionComponent', () => {
  let component: AccessEditComponent;
  let fixture: ComponentFixture<AccessEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessEditComponent]
    });
    fixture = TestBed.createComponent(AccessEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
