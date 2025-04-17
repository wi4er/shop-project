import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DirectoryInput } from '../../app/model/directory/directory.input';
import { Directory } from '../../app/model/directory';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../app/service/property-value.service';

@Component({
  selector: 'app-directory-form',
  templateUrl: './directory-form.component.html',
  styleUrls: ['./directory-form.component.css']
})
export class DirectoryFormComponent implements OnInit {

  loading = true;

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
      this.data?.id ? this.apiService.fetchItem<Directory>(ApiEntity.DIRECTORY, this.data.id) : null,
    ]).then(([property, flag, lang, data]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

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

  /**
   *
   */
  toEdit(item: Directory) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.propertyValueService.toEdit(item.property,  this.editProperties);

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  /**
   *
   */
  toInput(): DirectoryInput {
    const input = {
      id: this.id,
      property: [],
      flag: [],
    } as DirectoryInput;

    input.property = this.propertyValueService.toInput(this.editProperties);

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) input.flag.push(flag);
    }

    return input;
  }

  /**
   *
   */
  async sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<DirectoryInput>(
        ApiEntity.DIRECTORY,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<DirectoryInput>(
        ApiEntity.DIRECTORY,
        this.toInput(),
      )
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
