import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContactSettingsComponent } from './user-contact-settings.component';

describe('UserContactSettingsComponent', () => {
  let component: UserContactSettingsComponent;
  let fixture: ComponentFixture<UserContactSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserContactSettingsComponent]
    });
    fixture = TestBed.createComponent(UserContactSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
