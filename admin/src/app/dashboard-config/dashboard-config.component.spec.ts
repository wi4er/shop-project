import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardConfigComponent } from './dashboard-config.component';

describe('DashboardConfigComponent', () => {
  let component: DashboardConfigComponent;
  let fixture: ComponentFixture<DashboardConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardConfigComponent]
    });
    fixture = TestBed.createComponent(DashboardConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
