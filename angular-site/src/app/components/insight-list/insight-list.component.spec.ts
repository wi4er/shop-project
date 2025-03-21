import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsightListComponent } from './insight-list.component';

describe('InsightListComponent', () => {
  let component: InsightListComponent;
  let fixture: ComponentFixture<InsightListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InsightListComponent]
    });
    fixture = TestBed.createComponent(InsightListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
