import { Component, Input, OnInit } from '@angular/core';
import { ContactEntity } from '../../app/model/personal/contact.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FlagEntity } from '../../app/model/settings/flag.entity';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css'],
})
export class ContactEditComponent implements OnInit {

  loading = true;
  list: Array<ContactEntity> = [];

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
    this.apiService.fetchList<ContactEntity>(ApiEntity.CONTACT)
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
