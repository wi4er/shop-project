import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangFormComponent } from './lang-form.component';

describe('LangFormComponent', () => {
  let component: LangFormComponent;
  let fixture: ComponentFixture<LangFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LangFormComponent]
    });
    fixture = TestBed.createComponent(LangFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
