import { Component, Inject, OnInit } from '@angular/core';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FlagInput } from '../../app/model/settings/flag.input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';
import icons from './icons';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-flag-form',
  templateUrl: './flag-form.component.html',
  styleUrls: ['./flag-form.component.css'],
})
export class FlagFormComponent implements OnInit {

  loading = true;

  id: string = '';
  color: string | null = null;
  icon: string | null = null;
  iconSvg: string | null = null;
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  iconList = icons;

  constructor(
    private dialogRef: MatDialogRef<FlagFormComponent>,
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
    if (this.data?.id) {
      this.apiService.fetchItem<Flag>(
        ApiEntity.FLAG,
        this.data.id,
      ).then(data => {
        this.toEdit(data);
        this.loading = false;
      });
    }
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
  toEdit(item: Flag) {
    this.color = item.color;
    this.icon = item.icon;
    this.iconSvg = item.iconSvg;
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
  toInput(): FlagInput {
    return {
      id: this.id,
      color: this.color,
      icon: this.icon,
      iconSvg: this.iconSvg,
      property: this.propertyValueService.toInput(this.editProperties),
      flag: this.flagValueService.toInput(this.editFlags),
    };
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
      );
    } else {
      return this.apiService.postData<FlagInput>(
        ApiEntity.FLAG,
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

