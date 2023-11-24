import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Property } from '../../model/settings/property';
import { Lang } from '../../model/settings/lang';
import { Flag } from '../../model/settings/flag';
import { GroupInput } from '../../model/user/group.input';

@Component({
  selector: 'app-user-group-form',
  templateUrl: './user-group-form.component.html',
  styleUrls: ['./user-group-form.component.css']
})
export class UserGroupFormComponent {


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
    private dialogRef: MatDialogRef<UserGroupFormComponent>,
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
      this.apiService.fetchItem<Property>(ApiEntity.GROUP, this.data.id)
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
  }

  toInput(): GroupInput {
    const input: GroupInput = {
      id: +this.id,
      property: [],
      flag: [],
    } as GroupInput;

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
      this.apiService.postData<GroupInput>(
        ApiEntity.GROUP,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close()
      });
    }
  }

}
