import { Component, Inject, OnInit } from '@angular/core';
import { LangEntity } from '../../app/model/settings/lang.entity';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { LangInput } from '../../app/model/settings/lang.input';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-lang-form',
  templateUrl: './lang-form.component.html',
  styleUrls: ['./lang-form.component.css'],
})
export class LangFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<LangFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
  ) {
    if (data?.id) this.id = data.id;
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.data?.id ? this.apiService.fetchItem<LangEntity>(ApiEntity.LANG, this.data.id) : null,
    ]).then(([item]) => {
      if (item) this.toEdit(item);
    });
  }

  /**
   *
   */
  toEdit(item: LangEntity) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): LangInput {
    return {
      id: this.id,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<LangInput>(
        ApiEntity.LANG,
        this.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<LangInput>(
        ApiEntity.LANG,
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
