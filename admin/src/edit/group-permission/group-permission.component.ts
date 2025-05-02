import { Component, Input, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Group } from '../../app/model/user/group';
import { PermissionMethod } from '../../app/model/permission/permission-method';
import { PermissionEdit } from '../permission-value/permission-value.service';

@Component({
  selector: 'app-group-permission',
  templateUrl: './group-permission.component.html',
  styleUrls: ['./group-permission.component.css'],
})
export class GroupPermissionComponent implements OnInit {

  loading: boolean = true;
  groupList: Array<Group> = [];
  methodList: Array<string> = Object.keys(PermissionMethod);
  displayedColumns = ['groupId', ...this.methodList];

  @Input()
  permission: PermissionEdit = {};

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  handleChange(group: string, method: string) {
    if (!this.permission[group]) this.permission[group] = {};
    this.permission[group][method] = !this.permission[group][method];
  }

  getChecked(group: string, method: string) {
    return this.permission[group]?.[method] ?? false
  }

  /**
   *
   */
  getList() {
    const list = [];

    list.push({id: ''});
    list.push(...this.groupList);

    return list;
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<Group>(ApiEntity.GROUP),
    ]).then(([groups]) => {
      this.groupList = groups;
      this.loading = false;
    });
  }

}
