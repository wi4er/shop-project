import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { ContactInput } from '../../app/model/personal/contact.input';
import { ContactEntity } from '../../app/model/personal/contact.entity';
import { FormControl, Validators } from '@angular/forms';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-contact-feedback',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css'],
})
export class ContactFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};
  typeSelect = new FormControl(
    'EMAIL',
    [Validators.required, Validators.pattern('valid')],
  );

  constructor(
    private dialogRef: MatDialogRef<ContactFormComponent>,
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
      this.data?.id ? this.apiService.fetchItem<ContactEntity>(ApiEntity.CONTACT, this.data.id) : null,
    ]).then(([data]) => {
      if (data) this.toEdit(data);
    });
  }

  /**
   *
   */
  toEdit(item: ContactEntity) {
    this.id = item.id;
    this.typeSelect.setValue(item.type);
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): ContactInput {
    return {
      id: this.id,
      type: this.typeSelect.value ?? 'EMAIL',
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<ContactInput>(
        ApiEntity.CONTACT,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<ContactInput>(
        ApiEntity.CONTACT,
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
