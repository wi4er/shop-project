import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';
import { AttributeType } from '../../settings/attribute-form/attribute-form.component';

export interface AttributeEdit {
  [attribute: string]: {
    type: AttributeType.STRING;
    edit: {
      [lang: string]: FormControl
    },
  } | {
    type: AttributeType.DESCRIPTION;
    edit: {
      [lang: string]: FormControl,
    },
  } | {
    type: AttributeType.INTERVAL,
    from?: FormControl,
    to?: FormControl,
  } | {
    type: AttributeType.POINT;
    point: FormControl;
  }  | {
    type: AttributeType.COUNTER;
    counter: FormControl;
    count: FormControl;
  };
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
  ): Array<CommonAttributeValue> {
    const input: Array<CommonAttributeValue> = [];

    for (const attr in editAttributes) {
      const item = editAttributes[attr];

      if (item.type === AttributeType.STRING) {
        for (const lang in item.edit) {
          if (!item.edit[lang]?.value) continue;

          input.push({
            attribute: attr,
            string: item.edit[lang].value,
            lang: lang,
          });
        }
      }

      if (item.type === AttributeType.DESCRIPTION) {
        for (const lang in item.edit) {
          if (!item.edit[lang]?.value) continue;

          input.push({
            attribute: attr,
            description: item.edit[lang].value,
            lang: lang,
          });
        }
      }

      if (item.type === AttributeType.INTERVAL) {
        if (!item.from?.value) continue;

        input.push({
          attribute: attr,
          from: item.from?.value,
          to: item.to?.value,
        });
      }

      if (item.type === AttributeType.POINT) {
        if (!item.point?.value) continue;

        if (item.point.value) {
          input.push({
            attribute: attr,
            point: item.point.value,
          });
        }
      }

      if (item.type === AttributeType.COUNTER) {
        if (!item.count?.value) continue;

        if (item.counter.value) {
          input.push({
            attribute: attr,
            counter: item.counter.value,
            count: Number(item.count.value),
          });
        }
      }
    }

    return input;
  }

  /**
   *
   */
  toEdit(
    list: Array<CommonAttributeValue>,
  ): AttributeEdit {
    const edit: AttributeEdit = {};

    for (const attr of list ?? []) {
      if ('string' in attr) {
        if (!edit[attr.attribute]) {
          edit[attr.attribute] = {
            type: AttributeType.STRING,
            edit: {},
          };
        }

        const value = edit[attr.attribute];
        if ('edit' in value) {
          value.edit[attr.lang ?? ''] = new FormControl(attr.string);
        }
      }

      if ('description' in attr) {
        if (!edit[attr.attribute]) {
          edit[attr.attribute] = {
            type: AttributeType.DESCRIPTION,
            edit: {},
          };
        }

        const value = edit[attr.attribute];
        if ('edit' in value) {
          value.edit[attr.lang ?? ''] = new FormControl(attr.description);
        }
      }

      if ('from' in attr) {
        edit[attr.attribute] = {
          type: AttributeType.INTERVAL,
          from: new FormControl(attr.from),
          to: new FormControl(attr.to),
        };
      }

      if ('point' in attr) {
        edit[attr.attribute] = {
          type: AttributeType.POINT,
          point: new FormControl(attr.point),
        };
      }

      if ('counter' in attr) {
        edit[attr.attribute] = {
          type: AttributeType.COUNTER,
          counter: new FormControl(attr.counter),
          count: new FormControl(attr.count)
        };
      }
    }

    return edit;
  }

}

