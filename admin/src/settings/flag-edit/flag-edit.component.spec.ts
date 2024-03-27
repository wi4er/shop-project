import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagEditComponent } from './flag-edit.component';

describe('FlagEditComponent', () => {
  let component: FlagEditComponent;
  let fixture: ComponentFixture<FlagEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlagEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
