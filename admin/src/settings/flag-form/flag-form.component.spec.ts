import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagFormComponent } from './flag-form.component';

describe('FlagFormComponent', () => {
  let component: FlagFormComponent;
  let fixture: ComponentFixture<FlagFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlagFormComponent]
    });
    fixture = TestBed.createComponent(FlagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
