import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryHistoryComponent } from './directory-history.component';

describe('DirectoryHistoryComponent', () => {
  let component: DirectoryHistoryComponent;
  let fixture: ComponentFixture<DirectoryHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectoryHistoryComponent]
    });
    fixture = TestBed.createComponent(DirectoryHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
