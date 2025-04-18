import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { BlockInput } from '../../app/model/content/block.input';
import { Block } from '../../app/model/content/block';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';

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

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  editPermission: { [groupId: string]: { [method: string]: boolean } } = {};

  constructor(
    private dialogRef: MatDialogRef<BlockFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
    private propertyValueService: PropertyValueService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
      this.data?.id ? this.apiService.fetchItem<Block>(ApiEntity.BLOCK, this.data.id) : null,
    ]).then(([property, flag, lang, data]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
      if (data) this.toEdit(data);

      this.loading = false;
    })
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
        this.editProperties[prop.id] = {};

        this.editProperties[prop.id][lang.id ?? ''] = [{value: ''}];
      }

      this.editProperties[prop.id][''] = [];
    }

    for (const flag of this.flagList) {
      this.editFlags[flag.id] = false;
    }
  }

  /**
   *
   */
  toEdit(item: Block) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
    this.sort = item.sort;

    this.propertyValueService.toEdit(item.property,  this.editProperties);

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }

    for (const perm of item.permission) {
      if (!this.editPermission[perm.group ?? '']) this.editPermission[perm.group ?? ''] = {}
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
      property: [],
      flag: [],
      permission: [],
    } as BlockInput;

    input.property = this.propertyValueService.toInput(this.editProperties);

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) {
        input.flag.push(flag);
      }
    }

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
