import { Component } from '@angular/core';
import { UserService } from './service/user.service';
import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  title = 'admin';

  constructor(
    userService: UserService,
  ) {

  }

}
