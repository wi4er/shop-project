import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringEditComponent } from './string-edit.component';

describe('StringEditComponent', () => {
  let component: StringEditComponent;
  let fixture: ComponentFixture<StringEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StringEditComponent]
    });
    fixture = TestBed.createComponent(StringEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
