import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalPopupComponent } from './personal-popup.component';

describe('PersonalPopupComponent', () => {
  let component: PersonalPopupComponent;
  let fixture: ComponentFixture<PersonalPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalPopupComponent]
    });
    fixture = TestBed.createComponent(PersonalPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
