import { Component } from '@angular/core';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-personal-popup',
  templateUrl: './personal-popup.component.html',
  styleUrls: ['./personal-popup.component.css']
})
export class PersonalPopupComponent {

  userLogin: string = '';

  constructor(
    public userService: UserService
  ) {
    userService.user.subscribe(user => {
      if (user) this.userLogin = user.login;
    })
  }

}
