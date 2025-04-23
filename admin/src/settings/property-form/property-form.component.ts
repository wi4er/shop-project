import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { PropertyInput } from '../../app/model/settings/property.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';

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
      this.initEditValues();
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
  initEditValues() {
  }

  /**
   *
   */
  toEdit(item: Property) {
    this.id = item.id;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.propertyValueService.toEdit(item.property,  this.editProperties);

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  /**
   *
   */
  toInput(): PropertyInput {
    const input: PropertyInput = {
      id: this.id,
      property: [],
      flag: [],
    } as PropertyInput;

    input.property = this.propertyValueService.toInput(this.editProperties);

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) input.flag.push(flag);
    }

    return input;
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
