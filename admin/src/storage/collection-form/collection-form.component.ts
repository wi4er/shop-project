import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { CollectionEntity } from '../../app/model/storage/collection.entity';
import { CollectionInput } from '../../app/model/storage/collection.input';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.css'],
})
export class CollectionFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<CollectionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    if (this.data?.id) {
      this.apiService.fetchItem<CollectionEntity>(ApiEntity.COLLECTION, this.data.id)
        .then(res => this.toEdit(res));
    }
  }

  /**
   *
   */
  toEdit(item: CollectionEntity) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute)
    this.editFlags = this.flagValueService.toEdit(item.flag)
  }

  /**
   *
   */
  toInput(): CollectionInput {
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
      return this.apiService.putData<CollectionInput>(
        ApiEntity.COLLECTION,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<CollectionInput>(
        ApiEntity.COLLECTION,
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
