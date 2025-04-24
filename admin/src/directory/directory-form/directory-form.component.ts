import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DirectoryInput } from '../../app/model/directory/directory.input';
import { Directory } from '../../app/model/directory';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyValueService } from '../../edit/property-value/property-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-directory-form',
  templateUrl: './directory-form.component.html',
  styleUrls: ['./directory-form.component.css']
})
export class DirectoryFormComponent implements OnInit {

  loading = true;

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<DirectoryFormComponent>,
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
      this.data?.id ? this.apiService.fetchItem<Directory>(ApiEntity.DIRECTORY, this.data.id) : null,
    ]).then(([data]) => {
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
  toEdit(item: Directory) {
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
  toInput(): DirectoryInput {
    return {
      id: this.id,
      property: this.propertyValueService.toInput(this.editProperties),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  async sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<DirectoryInput>(
        ApiEntity.DIRECTORY,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<DirectoryInput>(
        ApiEntity.DIRECTORY,
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
