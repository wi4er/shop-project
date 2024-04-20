import { Component, Inject } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Element } from '../../app/model/content/element';
import { ElementInput } from '../../app/model/content/element-input';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-element-form',
  templateUrl: './element-form.component.html',
  styleUrls: ['./element-form.component.css'],
})
export class ElementFormComponent {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';
  permission: { [method: string]: number[] } = {
    READ: [],
    WRITE: [],
    DELETE: [],
    ALL: [],
  };

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  editImages: Array<{
    name: string,
    hash: string,
  }> = [];

  constructor(
    private dialogRef: MatDialogRef<ElementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, block: number } | null,
    private apiService: ApiService,
    private http: HttpClient,
  ) {
    if (data?.id) this.id = data.id;
  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
      this.data?.id ? this.apiService.fetchItem<Element>(ApiEntity.ELEMENT, this.id) : null,
    ]).then(([property, flag, lang, data]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
      if (data) this.toEdit(data);
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
        this.editProperties[prop.id][lang.id] = [];
      }

      this.editProperties[prop.id][''] = [];
    }

    for (const flag of this.flagList) {
      this.editFlags[flag.id] = false;
    }
  }

  toEdit(item: Element) {
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

  handleChangePermission = (method: string) => (id: number[]) => {
    this.permission[method] = id;
  };

  toInput(): ElementInput {
    const input: ElementInput = {
      id: this.data?.id,
      block: this.data?.block ?? 1,
      property: [],
      flag: [],
      permission: [{
        group: 1,
        method: 'ALL',
      }],
    } as ElementInput;

    for (const method in this.permission) {
      for (const group of this.permission[method]) {
        input.permission.push({method, group});
      }
    }

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

  onLoadImage(event: Event) {
    const target = event.target as HTMLInputElement;

    const file: File | undefined = target?.files?.[0];

    if (file) {
      const reader = new FileReader();
      const data = new FormData();

      reader.readAsDataURL(file);
      reader.onload = () => {
        this.editImages.push({
          name: file.name,
          hash: reader.result?.toString() ?? '',
        });

        data.append('file', file);

        this.http.post('http://localhost:3030/upload/10', data)
          .subscribe(res => {
            console.log(res);
          })
      };
    }
  }

  saveItem(event: Event) {
    event.preventDefault();

    // if (this.data?.id) {
    //   this.apiService.putData<ElementInput>(
    //     ApiEntity.ELEMENT,
    //     this.id,
    //     this.toInput(),
    //   ).then(() => this.dialogRef.close());
    // } else {
    //   this.apiService.postData<ElementInput>(
    //     ApiEntity.ELEMENT,
    //     this.toInput(),
    //   ).then(() => this.dialogRef.close());
    // }
  }

}
