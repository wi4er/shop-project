import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBlocksComponent } from './hero-blocks.component';

describe('HeroBlocksComponent', () => {
  let component: HeroBlocksComponent;
  let fixture: ComponentFixture<HeroBlocksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroBlocksComponent]
    });
    fixture = TestBed.createComponent(HeroBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
