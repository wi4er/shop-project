import { Component, Input } from '@angular/core';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { AttributeStringEdit } from '../attribute-value/attribute-value.service';
import { FormControl } from '@angular/forms';
import { LangEntity } from '../../app/model/settings/lang.entity';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-string-edit',
  templateUrl: './string-edit.component.html',
  styleUrls: ['./string-edit.component.css']
})
export class StringEditComponent {

  @Input({required: true})
  attribute!: AttributeEntity;

  @Input({required: true})
  edit!: AttributeStringEdit;

  @Input()
  langList!: LangEntity[];

  @Input()
  onHistory?: (attribute: string) => void;

  constructor(
    private dialog: MatDialog,
  ) {
  }

  /**
   *
   */
  clearEdit(lang: string, index: number) {
    const value = this.edit.edit[lang];

    if (value[index].value) {
      value[index].setValue('');
    } else {
      value.splice(index, 1);
    }
  }

  /**
   *
   */
  addEdit(lang: string) {
    const value = this.edit;

    if ('edit' in value) {
      value.edit[lang].push(new FormControl(null));
    }
  }

}
