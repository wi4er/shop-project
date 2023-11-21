import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Property } from '../../model/property';
import { Lang } from '../../model/lang';
import { Flag } from '../../model/flag';
import { Element } from '../../model/content/element';
import { ElementInput } from '../../model/content/element-input';
import { ApiEntity, ApiService } from '../../service/api.service';

@Component({
  selector: 'app-element-form',
  templateUrl: './element-form.component.html',
  styleUrls: ['./element-form.component.css'],
})
export class ElementFormComponent {

  created_at: string = '';
  updated_at: string = '';

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<ElementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, block: number } | null,
    private apiService: ApiService,
  ) {
  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchData<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchData<Flag>(ApiEntity.FLAG),
      this.apiService.fetchData<Lang>(ApiEntity.LANG),
    ]).then(([property, flag, lang]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
    });

    if (this.data?.id) {
      // this.toEdit(res.data.element.item as unknown as Element);
    }
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

  toEdit(item: Element) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  toInput(): ElementInput {
    const input: ElementInput = {
      id: this.data?.id,
      block: this.data?.block ?? 1,
      property: [],
      flag: [],
    } as ElementInput;

    for (const prop in this.editProperties) {
      for (const lang in this.editProperties[prop]) {
        if (!this.editProperties[prop][lang]) {
          continue;
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

  saveItem() {
    if (this.data?.id) {

    } else {
      this.apiService.postData<ElementInput>(
        ApiEntity.ELEMENT,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close()
      });
    }
  }

}
