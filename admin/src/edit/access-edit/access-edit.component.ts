import { Component, Input, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { GroupEntity } from '../../app/model/personal/group.entity';
import { PermissionEdit } from '../permission-value/permission-value.service';
import { AccessEntity } from '../../app/model/personal/access.entity';

@Component({
  selector: 'app-access-edit',
  templateUrl: './access-edit.component.html',
  styleUrls: ['./access-edit.component.css'],
})
export class AccessEditComponent implements OnInit {

  @Input()
  target!: string;

  @Input()
  edit!: PermissionEdit;

  loading: boolean = true;
  groupList: Array<GroupEntity> = [];
  methodList: Array<string> = ['GET', 'POST', 'PUT', 'DELETE'];
  displayedColumns = ['groupId', ...this.methodList];

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  handleChange(group: string, method: string) {
    if (!this.edit[group]) this.edit[group] = {};
    this.edit[group][method] = !this.edit[group][method];
  }

  /**
   *
   */
  getChecked(group: string, method: string) {
    return this.edit[group]?.[method] ?? false
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
      this.apiService.fetchList<GroupEntity>(ApiEntity.GROUP),
      this.apiService.fetchList<AccessEntity>(ApiEntity.ACCESS, {
        target: this.target,
      })
    ]).then(([groupList, accessList]) => {

      console.log(accessList);

      this.groupList = groupList;
      this.loading = false;
    });
  }

}
