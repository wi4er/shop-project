import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyFormComponent } from './property-form.component';

describe('PropertyFormComponent', () => {
  let component: PropertyFormComponent;
  let fixture: ComponentFixture<PropertyFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyFormComponent]
    });
    fixture = TestBed.createComponent(PropertyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
