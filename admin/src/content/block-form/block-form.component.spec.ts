import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockFormComponent } from './block-form.component';

describe('BlockFormComponent', () => {
  let component: BlockFormComponent;
  let fixture: ComponentFixture<BlockFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlockFormComponent]
    });
    fixture = TestBed.createComponent(BlockFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
