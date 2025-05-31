import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagSettingsComponent } from './flag-settings.component';

describe('FlagSettingsComponent', () => {
  let component: FlagSettingsComponent;
  let fixture: ComponentFixture<FlagSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlagSettingsComponent]
    });
    fixture = TestBed.createComponent(FlagSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
