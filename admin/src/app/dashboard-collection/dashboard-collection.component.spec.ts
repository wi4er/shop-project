import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCollectionComponent } from './dashboard-collection.component';

describe('DashboardCollectionComponent', () => {
  let component: DashboardCollectionComponent;
  let fixture: ComponentFixture<DashboardCollectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardCollectionComponent]
    });
    fixture = TestBed.createComponent(DashboardCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
