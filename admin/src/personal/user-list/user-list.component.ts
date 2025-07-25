import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserFormComponent } from '../user-form/user-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { UserEntity } from '../../app/model/personal/user.entity';
import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { FlagEntity } from '../../settings/model/flag.entity';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {

  userList: { [key: string]: string }[] = [];
  flagList: Array<FlagEntity> = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    this.refreshData();
  }

  /**
   *
   */
  isAllSelected() {
    return this.selection.selected.length === this.userList.length;
  }

  /**
   *
   */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.userList);
    }
  }

  /**
   *
   */
  changePage(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.refreshData();
  }

  /**
   *
   */
  getColumns() {
    return [
      'select',
      'action',
      ...this.columns,
    ];
  }

  /**
   *
   */
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<UserEntity>(ApiEntity.USER),
      this.apiService.countData(ApiEntity.USER),
    ]).then(([users, count]) => {
      this.setData(users);
      this.totalCount = count;
    });
  }

  /**
   *
   */
  private setData(data: UserEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.userList = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        login: item.login,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const it of item.attribute) {
        col.add('attribute_' + it.attribute);
        line['attribute_' + it.attribute] = it.string;
      }

      this.activeFlags[item.id] = item.flag;
      this.userList.push(line);
    }

    this.columns = ['id', 'login', 'created_at', 'updated_at', ...col];
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      UserFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  updateItem(id: number) {
    this.dialog.open(
      UserFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  toggleFlag(id: number, flag: string) {

  }

  /**
   *
   */
  async deleteList() {
    this.apiService.deleteList(
      ApiEntity.USER,
      this.selection.selected.map(item => item['id']),
    ).then(() => this.refreshData());
  }

  /**
   *
   * @param id
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.USER, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      UserSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
