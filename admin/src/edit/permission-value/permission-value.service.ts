import { Injectable } from '@angular/core';
import { PermissionValue } from '../../app/model/permission/permission-value';
import { PermissionInput } from '../../app/model/permission/permission-input';


export type PermissionEdit = {
  [groupId: string]: {
    [method: string]: boolean
  }
};

@Injectable({
  providedIn: 'root',
})
export class PermissionValueService {

  constructor() {
  }

  /**
   *
   */
  toEdit(list: PermissionValue[]) {
    const edit: PermissionEdit = {};

    for (const perm of list) {
      if (!edit[perm.group ?? '']) edit[perm.group ?? ''] = {};
      edit[perm.group ?? ''][perm.method] = true;
    }

    return edit;
  }

  /**
   *
   */
  toInput(edit: PermissionEdit) {
    const input: PermissionInput[] = [];

    for (const group in edit) {
      for (const method in edit[group]) {
        if (edit[group][method]) input.push({method, group: group ? group : undefined});
      }
    }

    return input;
  }

}
