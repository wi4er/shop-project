import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionEditComponent } from './description-edit.component';

describe('DescriptionEditComponent', () => {
  let component: DescriptionEditComponent;
  let fixture: ComponentFixture<DescriptionEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DescriptionEditComponent]
    });
    fixture = TestBed.createComponent(DescriptionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
