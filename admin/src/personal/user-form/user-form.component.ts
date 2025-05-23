import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { UserInput } from '../../app/model/personal/user.input';
import { UserEntity } from '../../app/model/personal/user.entity';
import { GroupEntity } from '../../app/model/personal/group.entity';
import { ContactEntity } from '../../app/model/personal/contact.entity';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-personal-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {

  loading = true;

  id: string = '';
  login: string = '';
  created_at: string = '';
  updated_at: string = '';

  groupList: Array<GroupEntity> = [];
  contactList: Array<ContactEntity> = [];

  editAttributes: AttributeEdit = {};
  editContact: { [attribute: string]: { value: string, error?: string } } = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
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
      this.apiService.fetchList<GroupEntity>(ApiEntity.GROUP),
      this.apiService.fetchList<ContactEntity>(ApiEntity.CONTACT),
      this.data?.id ? this.apiService.fetchItem<UserEntity>(ApiEntity.USER, this.id) : null,
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
  toEdit(item: UserEntity) {
    this.id = item.id;
    this.login = item.login;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
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
    this.sendItem().then(() => this.dialogRef.close());
  }

}
