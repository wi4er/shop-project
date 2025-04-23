import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSettingsComponent } from './contact-settings.component';

describe('UserContactSettingsComponent', () => {
  let component: ContactSettingsComponent;
  let fixture: ComponentFixture<ContactSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactSettingsComponent]
    });
    fixture = TestBed.createComponent(ContactSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
