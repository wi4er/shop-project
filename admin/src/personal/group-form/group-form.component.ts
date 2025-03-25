import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { GroupInput } from '../../app/model/user/group.input';
import { Group } from '../../app/model/user/group';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Contact } from '../../app/model/user/contact';
import { ContactInput } from '../../app/model/user/contact.input';

@Component({
  selector: 'app-user-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css']
})
export class GroupFormComponent implements OnInit {

  id: string = '';
  type: string = '';
  created_at: string = '';
  updated_at: string = '';

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<GroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
  ) {
    if (data?.id) this.id = String(data.id);
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
      this.data?.id ? this.apiService.fetchItem<Group>(ApiEntity.GROUP, String(this.data.id)) : null,
    ]).then(([property, flag, lang, data]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
      if (data) this.toEdit(data);
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
  toEdit(item: Group) {
    this.id = String(item.id);
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

  /**
   *
   */
  toInput(): GroupInput {
    const input: GroupInput = {
      id: +this.id,
      property: [],
      flag: [],
    } as GroupInput;

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

  /**
   *
   */
  saveItem() {
    if (this.data?.id) {
      this.apiService.putData<GroupInput>(
        ApiEntity.GROUP,
        this.data.id,
        this.toInput(),
      )
        .then(() => this.dialogRef.close())
        .catch((err: string) => {
          this.errorBar.open(err, 'close', {duration: 5000});
        });
    } else {
      this.apiService.postData<GroupInput>(
        ApiEntity.GROUP,
        this.toInput(),
      )
        .then(() => this.dialogRef.close())
        .catch((err: string) => {
          this.errorBar.open(err, 'close', {duration: 5000});
        });
    }
  }

}
