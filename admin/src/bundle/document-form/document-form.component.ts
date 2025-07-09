import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DocumentInput } from '../model/document.input';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';
import { DocumentEntity } from '../model/document.entity';
import { FieldEdit } from '../../feedback/form-form/form-form.component';
import { FieldValueService } from '../../edit/field-value/field-value.service';

@Component({
  selector: 'app-bundle-feedback',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css']
})
export class DocumentFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFields: FieldEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<DocumentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
    private fieldValueService: FieldValueService,
  ) {
    if (data?.id) this.id = String(data.id);
  }

  /**
   *
   */
  ngOnInit(): void {
    if (this.data?.id) {
      this.apiService.fetchItem<DocumentEntity>(ApiEntity.DOCUMENT, this.id)
        .then(res => {
          this.toEdit(res);

          this.loading = false;
        });
    } else {
      this.loading = false;
    }
  }

  /**
   *
   */
  toEdit(item: DocumentEntity) {
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
  toInput(): DocumentInput {
    return {
      id: this.id,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
      field: this.fieldValueService.toInput(this.editFields),
    };
  }

  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<DocumentInput>(
        ApiEntity.DOCUMENT,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<DocumentInput>(
        ApiEntity.DOCUMENT,
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
