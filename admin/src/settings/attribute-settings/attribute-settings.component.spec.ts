import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeSettingsComponent } from './attribute-settings.component';

describe('AttributeSettingsComponent', () => {
  let component: AttributeSettingsComponent;
  let fixture: ComponentFixture<AttributeSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttributeSettingsComponent]
    });
    fixture = TestBed.createComponent(AttributeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
