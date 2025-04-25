import { Component, Inject, OnInit } from '@angular/core';
import { Attribute } from '../../app/model/settings/attribute';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Collection } from '../../app/model/storage/collection';
import { CollectionInput } from '../../app/model/storage/collection.input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.css'],
})
export class CollectionFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  propertyList: Attribute[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<CollectionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Attribute>(ApiEntity.ATTRIBUTE),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
    ]).then(([property, flag, lang]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
    }).then(() => {
      if (this.data?.id) {
        this.apiService.fetchItem<Collection>(ApiEntity.COLLECTION, this.data.id)
          .then(res => this.toEdit(res));
      }
    });
  }

  getPropertyCount() {
    return Object.values(this.editProperties)
      .flatMap(item => Object.values(item).filter(item => item))
      .length;
  }

  initEditValues() {
    for (const prop of this.propertyList) {
      this.editProperties[prop.id] = {};

      for (const lang of this.langList) {
        this.editProperties[prop.id][lang.id] = [{value: ''}];
      }
    }

    for (const flag of this.flagList) {
      this.editFlags[flag.id] = false;
    }
  }

  toEdit(item: Collection) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    for (const prop of item.property) {
      if (!this.editProperties[prop.attribute]) {
        this.editProperties[prop.attribute] = {};
      }

      if (!this.editProperties[prop.attribute][prop.lang ?? '']) {
        this.editProperties[prop.attribute][prop.lang ?? ''] = [];
      }

      this.editProperties[prop.attribute][prop.lang ?? ''].push({
        value: prop.string,
        error: '',
      });
    }

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  toInput(): CollectionInput {
    const input: CollectionInput = {
      id: this.id,
      attribute: [],
      flag: [],
    } as CollectionInput;

    for (const prop in this.editProperties) {
      for (const lang in this.editProperties[prop]) {
        if (!this.editProperties[prop][lang]) {
          continue;
        }

        for (const value of this.editProperties[prop][lang]) {
          input.attribute.push({
            attribute: prop,
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
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<CollectionInput>(
        ApiEntity.COLLECTION,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<CollectionInput>(
        ApiEntity.COLLECTION,
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
