import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentSettringsComponent } from './document-settrings.component';

describe('DocumentSettringsComponent', () => {
  let component: DocumentSettringsComponent;
  let fixture: ComponentFixture<DocumentSettringsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentSettringsComponent]
    });
    fixture = TestBed.createComponent(DocumentSettringsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
