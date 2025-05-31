import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangHistoryComponent } from './lang-history.component';

describe('LangHistoryComponent', () => {
  let component: LangHistoryComponent;
  let fixture: ComponentFixture<LangHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LangHistoryComponent]
    });
    fixture = TestBed.createComponent(LangHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
