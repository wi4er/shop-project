import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSettingsComponent } from './file-settings.component';

describe('FileSettingsComponent', () => {
  let component: FileSettingsComponent;
  let fixture: ComponentFixture<FileSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileSettingsComponent]
    });
    fixture = TestBed.createComponent(FileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
