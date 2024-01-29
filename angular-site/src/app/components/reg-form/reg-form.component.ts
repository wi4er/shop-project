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
  country?: number;

}
