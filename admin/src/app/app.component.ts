import { Component } from '@angular/core';
import { UserService } from './service/user.service';
import { MatDialog } from '@angular/material/dialog';
import { PersonalPopupComponent } from './personal-popup/personal-popup.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  title = 'admin';

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
  ) {

  }

  handlePersonal() {
    this.dialog.open(
      PersonalPopupComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      }
    );
  }

  handleLogout() {
    this.userService.logOutUser()
  }

}
