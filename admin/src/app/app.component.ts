import { Component, ViewChild } from '@angular/core';
import { UserService } from './service/user.service';
import { MatDialog } from '@angular/material/dialog';
import { PersonalPopupComponent } from './personal-popup/personal-popup.component';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  @ViewChild(MatSidenav)
  drawer?: MatSidenav;

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
  ) {
  }

  /**
   *
   */
  openDrawer() {
    this.drawer?.toggle()
  }

  /**
   *
   */
  handlePersonal() {
    this.dialog.open(
      PersonalPopupComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      }
    );
  }

  /**
   *
   */
  handleLogout() {
    this.userService.logOutUser()
  }

}
