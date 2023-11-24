import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../service/api.service';
import { User } from '../../model/user/user';
import { Observable } from 'rxjs';
import { Group } from '../../model/user/group';
import { UserGroupFormComponent } from '../user-group-form/user-group-form.component';

@Component({
  selector: 'app-user-group-list',
  templateUrl: './user-group-list.component.html',
  styleUrls: ['./user-group-list.component.css']
})
export class UserGroupListComponent {

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  totalCount: number = 0;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {
  }

  ngOnInit(): void {

  }

  fetchList(args: string[] = []) {
    this.apiService.fetchData<Group>(ApiEntity.GROUP, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.GROUP)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Group[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['select', 'action', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      UserGroupFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      UserGroupFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    return dialog.afterClosed();
  }

  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {

  }
}
