import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldSettingsComponent } from './field-settings.component';

describe('FieldSettingsComponent', () => {
  let component: FieldSettingsComponent;
  let fixture: ComponentFixture<FieldSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FieldSettingsComponent]
    });
    fixture = TestBed.createComponent(FieldSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
