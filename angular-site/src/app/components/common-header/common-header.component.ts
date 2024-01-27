import { Component } from '@angular/core';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.css']
})
export class CommonHeaderComponent {

  menu = [{
    name: 'Discovery',
    link: '/',
    icon: '',
  }, {
    name: 'About',
    link: '/',
    icon: '',
  }, {
    name: 'Contact us',
    link: '/',
    icon: '',
  }];

  open = false;

  toggleOpen() {
    this.open = !this.open;
  }

}
