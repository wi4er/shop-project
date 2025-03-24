import { Component, Input } from '@angular/core';
import { Contact } from '../../app/model/user/contact';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css'],
})
export class ContactEditComponent {

  @Input()
  list: Array<Contact> = [];

  @Input()
  edit: { [property: string]: { value: string, error?: string } } = {};

  clearEdit(id: string) {
    this.edit[id] = {value: '', error: ''};
  }

}
