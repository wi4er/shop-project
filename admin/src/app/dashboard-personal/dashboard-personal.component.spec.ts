import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPersonalComponent } from './dashboard-personal.component';

describe('DashboardPersonalComponent', () => {
  let component: DashboardPersonalComponent;
  let fixture: ComponentFixture<DashboardPersonalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardPersonalComponent]
    });
    fixture = TestBed.createComponent(DashboardPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
