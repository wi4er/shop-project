import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorySettingsComponent } from './directory-settings.component';

describe('DirectorySettingsComponent', () => {
  let component: DirectorySettingsComponent;
  let fixture: ComponentFixture<DirectorySettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectorySettingsComponent]
    });
    fixture = TestBed.createComponent(DirectorySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
