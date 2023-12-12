import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthFormComponent } from '../auth-form/auth-form.component';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.css'],
})
export class AuthDialogComponent {

  current?: MatDialogRef<AuthFormComponent>;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
  ) {

    userService.user.subscribe(user => {
      console.log(user);

      if (user === null) {

        this.current = this.dialog.open(
          AuthFormComponent,
          {
            disableClose: true,
          },
        );
      } else {
        this.current?.close();
      }
    });
  }

}