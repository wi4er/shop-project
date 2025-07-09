import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldEditComponent } from './field-edit.component';

describe('FieldEditComponent', () => {
  let component: FieldEditComponent;
  let fixture: ComponentFixture<FieldEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FieldEditComponent]
    });
    fixture = TestBed.createComponent(FieldEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
