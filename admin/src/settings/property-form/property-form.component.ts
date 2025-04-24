import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { PropertyInput } from '../../app/model/settings/property.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.css'],
})
export class PropertyFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<PropertyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
    private propertyValueService: PropertyValueService,
    private flagValueService: FlagValueService,
  ) {
    if (data?.id) this.id = data.id;
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.data?.id ? this.apiService.fetchItem<Property>(ApiEntity.PROPERTY, this.data.id) : null,
    ]).then(([item]) => {
      if (item) this.toEdit(item);
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
  toEdit(item: Property) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editProperties = this.propertyValueService.toEdit(item.property);

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  /**
   *
   */
  toInput(): PropertyInput {
    return {
      id: this.id,
      property: this.propertyValueService.toInput(this.editProperties),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<PropertyInput>(
        ApiEntity.PROPERTY,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<PropertyInput>(
        ApiEntity.PROPERTY,
        this.toInput(),
      );
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
