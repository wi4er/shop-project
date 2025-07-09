import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { GroupEntity } from '../../app/model/personal/group.entity';
import { GroupFormComponent } from '../group-form/group-form.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { GroupSettingsComponent } from '../group-settings/group-settings.component';
import { FlagEntity } from '../../settings/model/flag.entity';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {

  contactList: { [key: string]: string }[] = [];
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

  ngOnInit(): void {
    this.refreshData();
  }

  isAllSelected() {
    return this.selection.selected.length === this.contactList.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.contactList);
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
      this.apiService.fetchList<GroupEntity>(ApiEntity.GROUP),
      this.apiService.countData(ApiEntity.GROUP),
    ]).then(([contacts, count]) => {
      this.setData(contacts);
      this.totalCount = count;
    });
  }

  /**
   *
   */
  private setData(data: GroupEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.contactList = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const it of item.attribute) {
        col.add('attribute_' + it.attribute);
        line['attribute_' + it.attribute] = it.string;
      }

      this.activeFlags[item.id] = item.flag;
      this.contactList.push(line);
    }

    this.columns = ['id', 'created_at', 'updated_at', ...col];
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      GroupFormComponent,
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
      GroupFormComponent,
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
      ApiEntity.GROUP,
      this.selection.selected.map(item => item['id']),
    ).then(() => this.refreshData());
  }

  /**
   *
   * @param id
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.GROUP, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      GroupSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
