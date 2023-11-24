import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupListComponent } from './user-group-list.component';

describe('UserGroupListComponent', () => {
  let component: UserGroupListComponent;
  let fixture: ComponentFixture<UserGroupListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserGroupListComponent]
    });
    fixture = TestBed.createComponent(UserGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
