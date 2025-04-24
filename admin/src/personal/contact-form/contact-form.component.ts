import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { ContactInput } from '../../app/model/user/contact.input';
import { Contact } from '../../app/model/user/contact';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { PropertyValueService } from '../../edit/property-value/property-value.service';
import { FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css'],
})
export class ContactFormComponent implements OnInit {

  id: string = '';
  created_at: string = '';
  updated_at: string = '';

  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};
  typeSelect = new FormControl(
    'EMAIL',
    [Validators.required, Validators.pattern('valid')],
  );

  constructor(
    private dialogRef: MatDialogRef<ContactFormComponent>,
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
      this.data?.id ? this.apiService.fetchItem<Contact>(ApiEntity.CONTACT, this.data.id) : null,
    ]).then(([data]) => {
      if (data) this.toEdit(data);
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
  toEdit(item: Contact) {
    this.id = item.id;
    this.typeSelect.setValue(item.type);
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
  toInput(): ContactInput {
    return {
      id: this.id,
      type: this.typeSelect.value ?? 'EMAIL',
      attribute: this.propertyValueService.toInput(this.editProperties),
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
    this.sendItem()
      .then(() => this.dialogRef.close())
      .catch((err: string) => {
        this.errorBar.open(err, 'close', {duration: 5000});
      });
  }

}
