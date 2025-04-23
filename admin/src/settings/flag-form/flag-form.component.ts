import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FlagInput } from '../../app/model/settings/flag.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';

@Component({
  selector: 'app-flag-form',
  templateUrl: './flag-form.component.html',
  styleUrls: ['./flag-form.component.css'],
})
export class FlagFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<FlagFormComponent>,
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
      this.data?.id ? this.apiService.fetchItem<Flag>(ApiEntity.FLAG, this.data.id) : null,
    ]).then(([data]) => {
      this.initEditValues();
      if (data) this.toEdit(data);

      this.loading = false;
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
  toInput(): FlagInput {
    const input: FlagInput = {
      id: this.id,
      property: [],
      flag: [],
    } as FlagInput;

    input.property = this.propertyValueService.toInput(this.editProperties);

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) {
        input.flag.push(flag);
      }
    }

    return input;
  }

  /**
   *
   */
  async sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<FlagInput>(
        ApiEntity.FLAG,
        this.data.id,
        this.toInput(),
      )
    } else {
      return this.apiService.postData<FlagInput>(
        ApiEntity.FLAG,
        this.toInput(),
      )
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

