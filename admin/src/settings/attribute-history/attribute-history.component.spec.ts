import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeHistoryComponent } from './attribute-history.component';

describe('AttributeHistoryComponent', () => {
  let component: AttributeHistoryComponent;
  let fixture: ComponentFixture<AttributeHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttributeHistoryComponent]
    });
    fixture = TestBed.createComponent(AttributeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
