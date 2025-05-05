import { Injectable } from '@angular/core';


export interface FlagEdit {
  [field: string]: boolean,
}

@Injectable({
  providedIn: 'root',
})
export class FlagValueService {

  constructor() {
  }

  /**
   *
   */
  toInput(edit: { [field: string]: boolean }): Array<string> {
    const input: Array<string> = [];

    for (const flag in edit) {
      if (edit[flag]) {
        input.push(flag);
      }
    }

    return input;
  }

  /**
   *
   */
  toEdit(flagList: Array<string>): FlagEdit {
    const edit: FlagEdit = {};

    for (const flag of flagList) {
      edit[flag] = true;
    }

    return edit;
  }

}
