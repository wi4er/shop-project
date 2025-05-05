import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryFormComponent } from './directory-form.component';

describe('DirectoryFormComponent', () => {
  let component: DirectoryFormComponent;
  let fixture: ComponentFixture<DirectoryFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectoryFormComponent]
    });
    fixture = TestBed.createComponent(DirectoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
