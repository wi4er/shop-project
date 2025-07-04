import { Component, Input } from '@angular/core';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { AttributeStringEdit } from '../attribute-value/attribute-value.service';
import { LangEntity } from '../../app/model/settings/lang.entity';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-description-edit',
  templateUrl: './description-edit.component.html',
  styleUrls: ['./description-edit.component.css']
})
export class DescriptionEditComponent {
  @Input({required: true})
  attribute!: AttributeEntity;

  @Input({required: true})
  edit!: AttributeStringEdit;

  @Input()
  langList!: LangEntity[];

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
