import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DirectoryInput } from '../../app/model/registry/directory.input';
import { Directory } from '../../app/model/registry/directory';
import { AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';
import { PermissionEdit, PermissionValueService } from '../../edit/permission-value/permission-value.service';

@Component({
  selector: 'app-registry-form',
  templateUrl: './directory-form.component.html',
  styleUrls: ['./directory-form.component.css'],
})
export class DirectoryFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: { [attribute: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  editPermission: PermissionEdit = {};

  constructor(
    private dialogRef: MatDialogRef<DirectoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
    private permissionValueService: PermissionValueService,
  ) {
    if (data?.id) this.id = data.id;
  }

  /**
   *
   */
  ngOnInit(): void {
    if (this.data?.id) {
      this.apiService.fetchItem<Directory>(ApiEntity.DIRECTORY, this.data.id)
        .then(data => {
          this.toEdit(data);
          this.loading = false;
        });
    } else {
      this.loading = false;
    }
  }

  /**
   *
   */
  toEdit(item: Directory) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
    this.editPermission = this.permissionValueService.toEdit(item.permission);
  }

  /**
   *
   */
  toInput(): DirectoryInput {
    return {
      id: this.id,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
      permission: this.permissionValueService.toInput(this.editPermission),
    };
  }

  /**
   *
   */
  async sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<DirectoryInput>(
        ApiEntity.DIRECTORY,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<DirectoryInput>(
        ApiEntity.DIRECTORY,
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
