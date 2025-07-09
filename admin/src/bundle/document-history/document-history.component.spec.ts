import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryComponent } from './document-history.component';

describe('DocumentHistoryComponent', () => {
  let component: DocumentHistoryComponent;
  let fixture: ComponentFixture<DocumentHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentHistoryComponent]
    });
    fixture = TestBed.createComponent(DocumentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
