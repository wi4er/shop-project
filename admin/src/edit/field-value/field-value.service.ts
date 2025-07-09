import { Injectable } from '@angular/core';
import { FlagEdit } from '../flag-value/flag-value.service';

@Injectable({
  providedIn: 'root'
})
export class FieldValueService {


  constructor() {
  }

  /**
   *
   */
  toInput(edit: { [field: string]: boolean }): Array<string> {
    const input: Array<string> = [];

    for (const field in edit) {
      if (edit[field]) {
        input.push(field);
      }
    }

    return input;
  }

  /**
   *
   */
  toEdit(fieldList: Array<string>): FlagEdit {
    const edit: FlagEdit = {};

    for (const field of fieldList ?? []) {
      edit[field] = true;
    }

    return edit;
  }

}
