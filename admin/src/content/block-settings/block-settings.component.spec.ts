import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSettingsComponent } from './block-settings.component';

describe('BlockSettingsComponent', () => {
  let component: BlockSettingsComponent;
  let fixture: ComponentFixture<BlockSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlockSettingsComponent]
    });
    fixture = TestBed.createComponent(BlockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
