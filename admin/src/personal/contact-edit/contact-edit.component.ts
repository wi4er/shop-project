import { Component, Input, OnInit } from '@angular/core';
import { Contact } from '../../app/model/user/contact';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Flag } from '../../app/model/settings/flag';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css'],
})
export class ContactEditComponent implements OnInit {

  loading = true;
  list: Array<Contact> = [];

  @Input()
  edit: { [property: string]: { value: string, error?: string } } = {};

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  ngOnInit() {
    this.apiService.fetchList<Contact>(ApiEntity.CONTACT)
      .then(list => {
        this.list = list;
        this.initValues();

        this.loading = false;
      });
  }

  /**
   *
   */
  initValues() {
    for (const item of this.list) {
      if (!this.edit[item.id]) {
        this.edit[item.id] = {
          value: '',
          error: '',
        }
      }
    }
  }

  /**
   *
   */
  clearEdit(id: string) {
    this.edit[id] = {value: '', error: ''};
  }

}
