import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { GroupInput } from '../../app/model/user/group.input';
import { Group } from '../../app/model/user/group';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-user-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css'],
})
export class GroupFormComponent implements OnInit {

  id: string = '';
  type: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<GroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
  ) {
    if (data?.id) this.id = String(data.id);
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.data?.id ? this.apiService.fetchItem<Group>(ApiEntity.GROUP, String(this.data.id)) : null,
    ]).then(([data]) => {
      if (data) this.toEdit(data);
    });
  }

  /**
   *
   */
  toEdit(item: Group) {
    this.id = String(item.id);
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): GroupInput {
    return {
      id: this.id,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<GroupInput>(
        ApiEntity.GROUP,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<GroupInput>(
        ApiEntity.GROUP,
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
