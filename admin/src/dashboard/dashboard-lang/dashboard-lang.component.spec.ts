import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLangComponent } from './dashboard-lang.component';

describe('DashboardLangComponent', () => {
  let component: DashboardLangComponent;
  let fixture: ComponentFixture<DashboardLangComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardLangComponent]
    });
    fixture = TestBed.createComponent(DashboardLangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
