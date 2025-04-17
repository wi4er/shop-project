import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardArchiveComponent } from './dashboard-archive.component';

describe('DashboardArchiveComponent', () => {
  let component: DashboardArchiveComponent;
  let fixture: ComponentFixture<DashboardArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardArchiveComponent]
    });
    fixture = TestBed.createComponent(DashboardArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
