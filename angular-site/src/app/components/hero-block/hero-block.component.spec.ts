import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBlockComponent } from './hero-block.component';

describe('HeroBlocksComponent', () => {
  let component: HeroBlockComponent;
  let fixture: ComponentFixture<HeroBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroBlockComponent]
    });
    fixture = TestBed.createComponent(HeroBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
