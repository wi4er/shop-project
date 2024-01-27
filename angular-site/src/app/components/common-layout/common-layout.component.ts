import { Component } from '@angular/core';

@Component({
  selector: 'app-common-layout',
  templateUrl: './common-layout.component.html',
  styleUrls: ['./common-layout.component.css']
})
export class CommonLayoutComponent {
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
  }]
}
