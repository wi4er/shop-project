import { Component, Inject } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DirectoryInput } from '../../app/model/directory/directory.input';
import { Directory } from '../../app/model/directory';

@Component({
  selector: 'app-directory-form',
  templateUrl: './directory-form.component.html',
  styleUrls: ['./directory-form.component.css']
})
export class DirectoryFormComponent {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<DirectoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
  ) {
    if (data?.id) this.id = data.id;
  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
    ]).then(([property, flag, lang]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
    });

    if (this.data?.id) {
      this.apiService.fetchItem<Directory>(ApiEntity.DIRECTORY, this.data.id)
        .then(res => {
          this.toEdit(res);
        });
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

  toEdit(item: Directory) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
  }

  toInput(): DirectoryInput {
    const input = {
      id: this.id,
      property: [],
      flag: [],
    } as DirectoryInput;

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
      if (this.editFlags[flag]) input.flag.push(flag);
    }

    return input;
  }

  saveItem() {
    if (this.data?.id) {
      this.apiService.putData<DirectoryInput>(
        ApiEntity.DIRECTORY,
        this.data.id,
        this.toInput(),
      ).then(() => this.dialogRef.close());
    } else {
      this.apiService.postData<DirectoryInput>(
        ApiEntity.DIRECTORY,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close()
      });
    }
  }

}
