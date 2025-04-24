import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlagValueService {

  constructor() { }

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

}
