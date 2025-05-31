import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagHistoryComponent } from './flag-history.component';

describe('FlagHistoryComponent', () => {
  let component: FlagHistoryComponent;
  let fixture: ComponentFixture<FlagHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlagHistoryComponent]
    });
    fixture = TestBed.createComponent(FlagHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
