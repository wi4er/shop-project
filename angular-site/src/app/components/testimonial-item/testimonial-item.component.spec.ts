import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialItemComponent } from './testimonial-item.component';

describe('TestimonialItemComponent', () => {
  let component: TestimonialItemComponent;
  let fixture: ComponentFixture<TestimonialItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialItemComponent]
    });
    fixture = TestBed.createComponent(TestimonialItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
