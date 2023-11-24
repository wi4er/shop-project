import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContactListComponent } from './user-contact-list.component';

describe('UserContactListComponent', () => {
  let component: UserContactListComponent;
  let fixture: ComponentFixture<UserContactListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserContactListComponent]
    });
    fixture = TestBed.createComponent(UserContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
