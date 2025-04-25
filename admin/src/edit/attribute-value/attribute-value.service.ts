import { Injectable } from '@angular/core';
import { StringAttributeValue } from '../../app/model/string-attribute-value';

export interface AttributeEdit {
  [property: string]: { [lang: string]: { value: string, error?: string }[] };
}

@Injectable({
  providedIn: 'root',
})
export class AttributeValueService {

  constructor() {
  }

  /**
   *
   */
  toInput(
    editAttributes: AttributeEdit,
  ): StringAttributeValue[] {
    const attribute: StringAttributeValue[] = [];

    for (const prop in editAttributes) {
      for (const lang in editAttributes[prop]) {
        if (!editAttributes[prop][lang]) continue;

        for (const value of editAttributes[prop][lang]) {
          if (!value.value) continue;

          attribute.push({
            attribute: prop,
            string: value.value,
            lang: lang || undefined,
          });
        }
      }
    }

    return attribute;
  }

  /**
   *
   */
  toEdit(
    list: StringAttributeValue[],
  ): AttributeEdit {
    const edit: {
      [attribute: string]: {
        [lang: string]: { value: string, error?: string }[]
      }
    } = {};

    for (const prop of list) {
      if (!edit[prop.attribute]) edit[prop.attribute] = {};
      if (!edit[prop.attribute][prop.lang ?? '']) edit[prop.attribute][prop.lang ?? ''] = [];

      edit[prop.attribute][prop.lang ?? ''].push({
        value: prop.string,
        error: '',
      });
    }

    return edit;
  }

}
