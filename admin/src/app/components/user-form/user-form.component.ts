import { Component, Inject } from '@angular/core';
import { Property } from '../../model/settings/property';
import { Lang } from '../../model/settings/lang';
import { Flag } from '../../model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../service/api.service';
import { UserInput } from '../../model/user/user.input';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {

  id: string = '';
  login: string = '';
  created_at: string = '';
  updated_at: string = '';

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
  ) {
    if (data?.id) this.id = data.id;
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
      this.apiService.fetchItem<Property>(ApiEntity.USER, this.data.id)
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

  toEdit(item: Property) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    // for (const flag of item.flag) {
    //   this.editFlags[flag] = true;
    // }
  }

  toInput(): UserInput {
    const input: UserInput = {
      id: +this.id,
      login: this.login,
      property: [],
      flag: [],
    } as UserInput;

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
      this.apiService.postData<UserInput>(
        ApiEntity.USER,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close()
      });
    }
  }

}
