import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryEditComponent } from './directory-edit.component';

describe('DirectoryEditComponent', () => {
  let component: DirectoryEditComponent;
  let fixture: ComponentFixture<DirectoryEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectoryEditComponent]
    });
    fixture = TestBed.createComponent(DirectoryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
