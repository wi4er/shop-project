import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointEditComponent } from './point-edit.component';

describe('PointEditComponent', () => {
  let component: PointEditComponent;
  let fixture: ComponentFixture<PointEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointEditComponent]
    });
    fixture = TestBed.createComponent(PointEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
