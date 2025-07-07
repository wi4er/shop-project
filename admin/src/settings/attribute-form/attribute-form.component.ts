import { Component, Inject, OnInit } from '@angular/core';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeInput } from '../../app/model/settings/attribute.input';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';
import { FormControl } from '@angular/forms';


export enum AttributeType {

  STRING = 'STRING',
  DESCRIPTION = 'DESCRIPTION',
  INTERVAL = 'INTERVAL',

  POINT = 'POINT',
  COUNTER = 'COUNTER',

  ELEMENT = 'ELEMENT',
  SECTION = 'SECTION',

  FILE = 'FILE',

  INSTANCE = 'INSTANCE',

}

@Component({
  selector: 'app-attribute-feedback',
  templateUrl: './attribute-form.component.html',
  styleUrls: ['./attribute-form.component.css'],
})
export class AttributeFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';
  block: string | null = null;
  directory: string | null = null;
  collection: string | null = null;

  type = new FormControl(AttributeType.STRING);
  typeList: Array<string> = Object.keys(AttributeType);

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<AttributeFormComponent>,
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
      this.data?.id ? this.apiService.fetchItem<AttributeEntity>(ApiEntity.ATTRIBUTE, this.data.id) : null,
    ]).then(([item]) => {
      if (item) this.toEdit(item);

      this.loading = false;
    });
  }

  /**
   *
   */
  toEdit(item: AttributeEntity) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
    this.type.setValue(AttributeType[item.type]);
    this.block = item.block;
    this.directory = item.directory;
    this.collection = item.collection;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): AttributeInput {
    return {
      id: this.id,
      type: this.type.value ? AttributeType[this.type.value] : '',
      block: this.block,
      directory: this.directory,
      collection: this.collection,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<AttributeInput>(
        ApiEntity.ATTRIBUTE,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<AttributeInput>(
        ApiEntity.ATTRIBUTE,
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

  protected readonly AttributeType = AttributeType;

}
