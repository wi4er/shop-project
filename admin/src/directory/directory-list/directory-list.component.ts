import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DirectoryFormComponent } from '../directory-form/directory-form.component';
import { Directory } from '../../app/model/directory';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Observable } from 'rxjs';
import { StringifiableRecord } from 'query-string/base';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { Property } from '../../app/model/settings/property';
import { Flag } from '../../app/model/settings/flag';
import { Lang } from '../../app/model/settings/lang';

@Component({
  selector: 'app-directory-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.css'],
})
export class DirectoryListComponent implements OnInit {

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  flagList: string[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);


  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
    private router: Router,
  ) {
  }

  getColumns() {
    return [
      'select',
      'action',
      'moveto',
      ...this.columns,
    ];
  }

  isAllSelected() {
    return this.selection.selected.length === this.list.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.list);
    }
  }

  changePage(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.fetchList({
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<Directory>(
        ApiEntity.DIRECTORY,
        {
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(ApiEntity.DIRECTORY),
    ]).then(([data, count]) => {
      this.setData(data);
      this.totalCount = count;
      this.selection.clear();
    });
  }

  fetchList(args: StringifiableRecord) {
    this.apiService.fetchList<Directory>(ApiEntity.DIRECTORY, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.DIRECTORY)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Directory[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const it of item.property) {
        col.add('property_' + it.property);
        line['property_' + it.property] = it.string;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = [ 'id', 'created_at', 'updated_at', ...col ];
  }

  addItem() {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  updateItem(id: number) {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  onNext(id: string) {
    this.router.navigate(
      ['/directory', id],
      {},
    );
  }

  toggleFlag(id: number, flag: string) {
  }

  async deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.DIRECTORY, list)
      .then(() => this.refreshData());
  }

  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.DIRECTORY, [id])
      .then(() => this.refreshData());
  }

}
