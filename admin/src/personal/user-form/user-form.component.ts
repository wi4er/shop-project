import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { UserInput } from '../../app/model/user/user.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../app/model/user/user';
import { Group } from '../../app/model/user/group';
import { Contact } from '../../app/model/user/contact';
import { AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {

  loading = true;

  id: string = '';
  login: string = '';
  created_at: string = '';
  updated_at: string = '';

  groupList: Array<Group> = [];
  contactList: Array<Contact> = [];

  editAttributes: { [attribute: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editContact: { [attribute: string]: { value: string, error?: string } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
  ) {
    if (data?.id) this.id = data.id;
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Group>(ApiEntity.GROUP),
      this.apiService.fetchList<Contact>(ApiEntity.CONTACT),
      this.data?.id ? this.apiService.fetchItem<User>(ApiEntity.USER, this.id) : null,
    ]).then(([group, contact, data]) => {
      this.groupList = group;
      this.contactList = contact;

      if (data) this.toEdit(data);

      this.loading = false;
    });
  }

  /**
   *
   */
  getAttributeCount() {
    return Object.values(this.editAttributes)
      .flatMap(item => Object.values(item).filter(item => item))
      .length;
  }

  /**
   *
   */
  toEdit(item: User) {
    this.id = item.id;
    this.login = item.login;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  /**
   *
   */
  toInput(): UserInput {
    return {
      id: +this.id,
      login: this.login,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  sendItem() {
    if (this.data?.id) {
      return this.apiService.putData<UserInput>(
        ApiEntity.USER,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<UserInput>(
        ApiEntity.USER,
        this.toInput(),
      );
    }
  }

  /**
   *
   */
  saveItem() {
    this.sendItem()
      .then(() => this.dialogRef.close())
      .catch((err: string) => {
        this.errorBar.open(err, 'close', {duration: 5000});
      });
  }

}
