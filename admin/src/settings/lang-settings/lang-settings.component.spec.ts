import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSettingsComponent } from './lang-settings.component';

describe('LangSettingsComponent', () => {
  let component: LangSettingsComponent;
  let fixture: ComponentFixture<LangSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LangSettingsComponent]
    });
    fixture = TestBed.createComponent(LangSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
