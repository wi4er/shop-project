import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldHistoryComponent } from './field-history.component';

describe('FieldHistoryComponent', () => {
  let component: FieldHistoryComponent;
  let fixture: ComponentFixture<FieldHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FieldHistoryComponent]
    });
    fixture = TestBed.createComponent(FieldHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
