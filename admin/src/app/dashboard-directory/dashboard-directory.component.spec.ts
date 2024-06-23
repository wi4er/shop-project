import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDirectoryComponent } from './dashboard-directory.component';

describe('DashboardDirectoryComponent', () => {
  let component: DashboardDirectoryComponent;
  let fixture: ComponentFixture<DashboardDirectoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardDirectoryComponent]
    });
    fixture = TestBed.createComponent(DashboardDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
