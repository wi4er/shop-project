import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonFooterComponent } from './common-footer.component';

describe('CommonFooterComponent', () => {
  let component: CommonFooterComponent;
  let fixture: ComponentFixture<CommonFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommonFooterComponent]
    });
    fixture = TestBed.createComponent(CommonFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
