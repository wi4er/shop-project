import { Component } from '@angular/core';

@Component({
  selector: 'app-reg-form',
  templateUrl: './reg-form.component.html',
  styleUrls: ['./reg-form.component.css']
})
export class RegFormComponent {

  contact: string = '';
  password: string = '';
  confirm: string = '';

  newsletter: boolean = false;

  name: string = '';
  second: string = '';
  address: string = '';
  note: string = '';

  city: string = '';
  postal: string = '';
  province?: string;
  country?: string;

  provinceList = [{
    id: '1',
    name: 'Position 1111'
  }, {
    id: '2',
    name: 'Position 2222'
  },{
    id: '3',
    name: 'Position 3333'
  },{
    id: '4',
    name: 'Position 4444'
  },{
    id: '5',
    name: 'Position 5555'
  },{
    id: '6',
    name: 'Position 6666'
  }]

}
