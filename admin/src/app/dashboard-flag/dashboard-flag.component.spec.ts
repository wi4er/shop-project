import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFlagComponent } from './dashboard-flag.component';

describe('DashboardFlagComponent', () => {
  let component: DashboardFlagComponent;
  let fixture: ComponentFixture<DashboardFlagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardFlagComponent]
    });
    fixture = TestBed.createComponent(DashboardFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
