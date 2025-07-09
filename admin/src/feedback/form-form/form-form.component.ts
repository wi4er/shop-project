import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';
import { FormInput } from '../model/form.input';
import { FieldValueService } from '../../edit/field-value/field-value.service';
import { FormEntity } from '../model/form.entity';


export interface FieldEdit {
  [field: string]: boolean,
}

@Component({
  selector: 'app-feedback-feedback',
  templateUrl: './form-form.component.html',
  styleUrls: ['./form-form.component.css'],
})
export class FormFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';
  block: string | null = null;
  directory: string | null = null;
  collection: string | null = null;

  editAttributes: AttributeEdit = {};
  editFields: FieldEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<FormFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
    private fieldValueService: FieldValueService,
  ) {
    if (data?.id) this.id = data.id;
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.data?.id ? this.apiService.fetchItem<FormEntity>(ApiEntity.FORM, this.data.id) : null,
    ]).then(([item]) => {
      if (item) this.toEdit(item);

      this.loading = false;
    });
  }

  /**
   *
   */
  toEdit(item: FormEntity) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
    this.editFields = this.fieldValueService.toEdit(item.field);
  }

  /**
   *
   */
  toInput(): FormInput {
    return {
      id: this.id,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
      field: this.fieldValueService.toInput(this.editFields),
    };
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<FormInput>(
        ApiEntity.FORM,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<FormInput>(
        ApiEntity.FORM,
        this.toInput(),
      );
    }
  }

  /**
   *
   */
  saveItem() {
    this.sendItem().then(() => this.dialogRef.close());
  }

}
