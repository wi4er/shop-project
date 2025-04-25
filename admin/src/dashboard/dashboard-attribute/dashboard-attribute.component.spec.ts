import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAttributeComponent } from './dashboard-attribute.component';

describe('DashboardPropertyComponent', () => {
  let component: DashboardAttributeComponent;
  let fixture: ComponentFixture<DashboardAttributeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardAttributeComponent]
    });
    fixture = TestBed.createComponent(DashboardAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
