import { Component, Inject, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { LangInput } from '../../app/model/settings/lang.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-lang-form',
  templateUrl: './lang-form.component.html',
  styleUrls: ['./lang-form.component.css'],
})
export class LangFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<LangFormComponent>,
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
      this.data?.id ? this.apiService.fetchItem<Lang>(ApiEntity.LANG, this.data.id) : null,
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
  toInput(): LangInput {
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
    this.sendItem()
      .then(() => this.dialogRef.close())
      .catch((err: string) => {
        this.errorBar.open(err, 'close', {duration: 5000});
      });
  }

}
