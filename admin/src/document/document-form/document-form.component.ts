import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DocumentInput } from '../../app/model/document.input';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';
import { Document } from '../../app/model/document';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css']
})
export class DocumentFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<DocumentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,

  ) {
    if (data?.id) this.id = String(data.id);
  }

  /**
   *
   */
  ngOnInit(): void {
    if (this.data?.id) {
      this.apiService.fetchItem<Document>(ApiEntity.DOCUMENT, this.id)
        .then(res => {
          this.toEdit(res);
        });
    }
  }

  /**
   *
   */
  toEdit(item: Document) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): DocumentInput {
    return {
      id: +this.id,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  saveItem() {
    if (this.data?.id) {

    } else {
      this.apiService.postData<DocumentInput>(
        ApiEntity.DOCUMENT,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close()
      });
    }
  }

}
