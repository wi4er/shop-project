import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { UserInput } from '../../app/model/user/user.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../app/model/user/user';
import { Group } from '../../app/model/user/group';
import { Contact } from '../../app/model/user/contact';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {

  id: string = '';
  login: string = '';
  created_at: string = '';
  updated_at: string = '';

  propertyList: Array<Property> = [];
  langList: Array<Lang> = [];
  flagList: Array<Flag> = [];
  groupList: Array<Group> = []
  contactList: Array<Contact> = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editContact: { [property: string]: { value: string, error?: string } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
  ) {
    if (data?.id) this.id = data.id;
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
      this.apiService.fetchList<Group>(ApiEntity.GROUP),
      this.apiService.fetchList<Contact>(ApiEntity.CONTACT),
      this.data?.id ? this.apiService.fetchItem<User>(ApiEntity.USER, this.id) : null,
    ]).then(([property, flag, lang, group, contact, data]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;
      this.groupList = group;
      this.contactList = contact;

      this.initEditValues();
      if (data) this.toEdit(data);
    });
  }

  /**
   *
   */
  getPropertyCount() {
    return Object.values(this.editProperties)
      .flatMap(item => Object.values(item).filter(item => item))
      .length;
  }

  /**
   *
   */
  initEditValues() {
    for (const prop of this.propertyList) {
      this.editProperties[prop.id] = {};

      for (const lang of this.langList) {
        this.editProperties[prop.id][lang.id] = [];
      }

      this.editProperties[prop.id][''] = [];
    }

    for (const flag of this.flagList) {
      this.editFlags[flag.id] = false;
    }
  }

  /**
   *
   * @param item
   */
  toEdit(item: User) {
    this.id = item.id;
    this.login = item.login;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    for (const prop of item.property) {
      this.editProperties[prop.property][prop.lang ?? ''].push({
        value: prop.string,
        error: '',
      });
    }

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  /**
   *
   */
  toInput(): UserInput {
    const input: UserInput = {
      id: +this.id,
      login: this.login,
      property: [],
      flag: [],
    } as UserInput;

    for (const prop in this.editProperties) {
      for (const lang in this.editProperties[prop]) {
        if (!this.editProperties[prop][lang]) continue;

        for (const value of this.editProperties[prop][lang]) {
          input.property.push({
            property: prop,
            string: value.value,
            lang: lang || undefined,
          });
        }
      }
    }

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) {
        input.flag.push(flag);
      }
    }

    return input;
  }

  /**
   *
   */
  saveItem() {
    if (this.data?.id) {
      this.apiService.putData<UserInput>(
        ApiEntity.USER,
        this.data.id,
        this.toInput(),
      )
        .then(() => this.dialogRef.close())
        .catch((err: string) => {
          this.errorBar.open(err, 'close', {duration: 5000});
        });
    } else {
      this.apiService.postData<UserInput>(
        ApiEntity.USER,
        this.toInput(),
      )
        .then(() => this.dialogRef.close())
        .catch((err: string) => {
          this.errorBar.open(err, 'close', {duration: 5000});
        });
    }
  }

}
