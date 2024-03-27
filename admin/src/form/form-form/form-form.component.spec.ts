import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFormComponent } from './form-form.component';

describe('FormFormComponent', () => {
  let component: FormFormComponent;
  let fixture: ComponentFixture<FormFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormFormComponent]
    });
    fixture = TestBed.createComponent(FormFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
