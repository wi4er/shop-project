import { Injectable } from '@angular/core';
import { StringPropertyValue } from '../model/string-property-value';

export interface PropertyEdit {
  [property: string]: { [lang: string]: { value: string, error?: string }[] };
}

@Injectable({
  providedIn: 'root',
})
export class PropertyValueService {

  constructor() {
  }


  toInput(
    editProperties: PropertyEdit,
  ): StringPropertyValue[] {
    const property: StringPropertyValue[] = [];

    for (const prop in editProperties) {
      for (const lang in editProperties[prop]) {
        if (!editProperties[prop][lang]) continue;

        for (const value of editProperties[prop][lang]) {
          if (!value.value) continue;

          property.push({
            property: prop,
            string: value.value,
            lang: lang || undefined,
          });
        }
      }
    }

    return property;
  }

  /**
   *
   */
  toEdit(
    list: StringPropertyValue[],
    edit: PropertyEdit,
  ): PropertyEdit {
    for (const prop of list) {
      edit[prop.property][prop.lang ?? ''].push({
        value: prop.string,
        error: '',
      });
    }

    return edit;
  }

}
