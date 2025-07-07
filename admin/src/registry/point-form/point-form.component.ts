import { Component, Inject, OnInit } from '@angular/core';
import { PermissionEdit } from '../../edit/permission-value/permission-value.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';
import { PointInput } from '../../app/model/registry/point.input';
import { Point } from '../../app/model/registry/point';

@Component({
  selector: 'app-point-feedback',
  templateUrl: './point-form.component.html',
  styleUrls: ['./point-form.component.css']
})
export class PointFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};
  editPermission: PermissionEdit = {};

  constructor(
    private dialogRef: MatDialogRef<PointFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id?: string, directory: string },
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
    if (this.data?.id) {
      this.apiService.fetchItem<Point>(ApiEntity.POINT, this.data.id)
        .then(data => {
          this.toEdit(data);
          this.loading = false;
        });
    } else {
      this.loading = false;
    }
  }

  /**
   *
   */
  toEdit(item: Point) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): PointInput {
    console.log(this.data.directory);
    return {
      id: this.id,
      directory: this.data.directory,
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  async sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<PointInput>(
        ApiEntity.POINT,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<PointInput>(
        ApiEntity.POINT,
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
