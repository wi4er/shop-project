import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FormInput } from '../../app/model/form/form.input';

@Component({
  selector: 'app-form-form',
  templateUrl: './form-form.component.html',
  styleUrls: ['./form-form.component.css']
})
export class FormFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<FormFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
  ) {
    if (data?.id) this.id = data.id;
  }

  ngOnInit(): void {
    if (this.data?.id) {
      this.apiService.fetchItem<Flag>(ApiEntity.FORM, this.data.id)
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
  }

  toEdit(item: Property) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
  }

  toInput(): FormInput {
    const input: FormInput = {
      id: this.id,
      property: [],
      flag: [],
    } as FormInput;

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
      this.apiService.postData<FormInput>(
        ApiEntity.FORM,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close()
      });
    }
  }


}
