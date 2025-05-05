import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointPageComponent } from './point-page.component';

describe('PointPageComponent', () => {
  let component: PointPageComponent;
  let fixture: ComponentFixture<PointPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointPageComponent]
    });
    fixture = TestBed.createComponent(PointPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
