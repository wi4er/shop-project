import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Element } from '../../app/model/content/element';
import { ElementInput } from '../../app/model/content/element.input';
import { Collection } from '../../app/model/storage/collection';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';

@Component({
  selector: 'app-element-form',
  templateUrl: './element-form.component.html',
  styleUrls: ['./element-form.component.css'],
})
export class ElementFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';
  sort: number = 100;

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];
  collectionList: Array<Collection> = [];

  imageList: {
    [collection: string]: Array<{
      id: number,
      path: string,
      original: string,
    }>
  } = {};

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  editImages: {
    [collection: string]: Array<{
      id?: number,
      file: File,
      name: string,
      hash: string,
    }>
  } = {};
  editPermission: {
    [groupId: string]: { [method: string]: boolean }
  } = {};

  constructor(
    private dialogRef: MatDialogRef<ElementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, block: number } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
    private propertyValueService: PropertyValueService,
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
      this.apiService.fetchList<Collection>(ApiEntity.COLLECTION),
      this.data?.id ? this.apiService.fetchItem<Element>(ApiEntity.ELEMENT, this.id) : null,
    ]).then(([property, flag, lang, collection, data]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;
      this.collectionList = collection;

      this.initEditValues();
      if (data) this.toEdit(data);

      this.loading = false;
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
    for (const col of this.collectionList) {
      this.imageList[col.id] = [];
      this.editImages[col.id] = [];
    }

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
   */
  toEdit(item: Element) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
    this.sort = item.sort;

    for (const img of item.image) {
      if (!this.imageList[img.collection]) this.imageList[img.collection] = [];

      this.imageList[img.collection].push({
        id: img.image,
        path: img.path,
        original: img.original,
      });
    }

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
  toInput(): ElementInput {
    const input: ElementInput = {
      id: this.id || undefined,
      block: this.data?.block ?? 1,
      sort: this.sort,
      image: [],
      property: [],
      flag: [],
      permission: [],
    } as ElementInput;

    for (const collection in this.editImages) {
      for (const image of this.editImages[collection]) {
        if (image.id) input.image.push(image.id);
      }
    }

    for (const col in this.imageList) {
      for (const image of this.imageList[col]) {
        input.image.push(image.id);
      }
    }

    input.property = this.propertyValueService.toInput(this.editProperties);

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) input.flag.push(flag);
    }

    for (const group in this.editPermission) {
      for (const method in this.editPermission[group]) {
        if (this.editPermission[group][method]) input.permission.push({method, group: group ? group : undefined});
      }
    }

    return input;
  }

  /**
   *
   */
  async sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<ElementInput>(
        ApiEntity.ELEMENT,
        this.data.id,
        this.toInput(),
      )
    } else {
      return this.apiService.postData<ElementInput>(
        ApiEntity.ELEMENT,
        this.toInput(),
      )
    }
  }

  /**
   *
   */
  async saveItem(event: Event) {
    event.preventDefault();

    for (const collection in this.editImages) {
      for (const file of this.editImages[collection]) {
        const data = new FormData();
        data.append('file', file.file);
        data.append('collection', collection);

        const saved = await fetch('http://localhost:3030/upload', {
          method: 'POST',
          credentials: 'include',
          body: data,
        }).then(res => res.json());

        file.id = saved.id;
      }
    }

    this.sendItem()
      .then(() => this.dialogRef.close())
      .catch((err: string) => {
        this.errorBar.open(err, 'close', {duration: 5000});
      });
  }

}
