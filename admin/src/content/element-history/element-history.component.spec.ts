import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementHistoryComponent } from './element-history.component';

describe('ElementHistoryComponent', () => {
  let component: ElementHistoryComponent;
  let fixture: ComponentFixture<ElementHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ElementHistoryComponent]
    });
    fixture = TestBed.createComponent(ElementHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
