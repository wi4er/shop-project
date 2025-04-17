import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPropertyComponent } from './dashboard-property.component';

describe('DashboardPropertyComponent', () => {
  let component: DashboardPropertyComponent;
  let fixture: ComponentFixture<DashboardPropertyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardPropertyComponent]
    });
    fixture = TestBed.createComponent(DashboardPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
