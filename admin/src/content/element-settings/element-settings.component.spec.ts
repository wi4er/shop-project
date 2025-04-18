import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementSettingsComponent } from './element-settings.component';

describe('ElementSettingsComponent', () => {
  let component: ElementSettingsComponent;
  let fixture: ComponentFixture<ElementSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ElementSettingsComponent]
    });
    fixture = TestBed.createComponent(ElementSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
