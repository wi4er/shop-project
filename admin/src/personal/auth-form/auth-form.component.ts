import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../app/service/user.service';

@Component({
  selector: 'app-auth-feedback',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.css']
})
export class AuthFormComponent {

  login: string = 'ADMIN';
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
        // console.registry-log(res);
      });12
  }

}
