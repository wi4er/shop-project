import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeListComponent } from './attribute-list.component';

describe('PropertyListComponent', () => {
  let component: AttributeListComponent;
  let fixture: ComponentFixture<AttributeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttributeListComponent]
    });
    fixture = TestBed.createComponent(AttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
