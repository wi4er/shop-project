import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { BlockInput } from '../../app/model/content/block.input';
import { Block } from '../../app/model/content/block';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-block-form',
  templateUrl: './block-form.component.html',
  styleUrls: ['./block-form.component.css'],
})
export class BlockFormComponent implements OnInit {

  loading = true;

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
    private errorBar: MatSnackBar,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
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
  getPropertyCount() {
    return Object.values(this.editAttributes)
      .flatMap(item => Object.values(item).filter(item => item))
      .length;
  }

  /**
   *
   */
  toEdit(item: Block) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
    this.sort = item.sort;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }

    for (const perm of item.permission) {
      if (!this.editPermission[perm.group ?? '']) this.editPermission[perm.group ?? ''] = {};
      this.editPermission[perm.group ?? ''][perm.method] = true;
    }
  }

  /**
   *
   */
  toInput(): BlockInput {
    const input: BlockInput = {
      id: this.data?.id,
      sort: +this.sort,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
      permission: [],
    } as BlockInput;

    for (const group in this.editPermission) {
      for (const method in this.editPermission[group]) {
        if (this.editPermission[group][method]) {
          input.permission.push({method, group: group ? group : undefined});
        }
      }
    }

    return input;
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
    this.sendItem()
      .then(() => this.dialogRef.close())
      .catch((err: string) => {
        this.errorBar.open(err, 'close', {duration: 5000});
      });
  }

}
