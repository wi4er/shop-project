import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { BlockInput } from '../../app/model/content/block.input';
import { Block } from '../../app/model/content/block';
import { AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';
import { PermissionValueService } from '../../edit/permission-value/permission-value.service';

@Component({
  selector: 'app-block-form',
  templateUrl: './block-form.component.html',
  styleUrls: ['./block-form.component.css'],
})
export class BlockFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';
  sort: number = 100;

  editAttributes: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  editPermission: { [groupId: string]: { [method: string]: boolean } } = {};

  constructor(
    private dialogRef: MatDialogRef<BlockFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
    private permissionValueService: PermissionValueService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.data?.id ? this.apiService.fetchItem<Block>(ApiEntity.BLOCK, this.data.id) : null,
    ]).then(([data]) => {
      if (data) this.toEdit(data);

      this.loading = false;
    });
  }

  /**
   *
   */
  toEdit(item: Block) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
    this.sort = item.sort;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
    this.editPermission = this.permissionValueService.toEdit(item.permission);
  }

  /**
   *
   */
  toInput(): BlockInput {
    return {
      id: this.id || undefined,
      sort: +this.sort,
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
      return this.apiService.putData<BlockInput>(
        ApiEntity.BLOCK,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<BlockInput>(
        ApiEntity.BLOCK,
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
