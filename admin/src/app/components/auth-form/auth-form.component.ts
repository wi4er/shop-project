import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.css']
})
export class AuthFormComponent {

  login: string = 'USER_1';
  password: string = 'qwerty';

  constructor(
    private dialogRef: MatDialogRef<AuthFormComponent>,
    private userService: UserService,
  ) {
  }

  /**
   *
   */
  handleSend() {
    this.userService.authUser(this.login, this.password)
      .then(res => {
        // this.dialogRef.close();
        // console.log(res);
      });12
  }

}
