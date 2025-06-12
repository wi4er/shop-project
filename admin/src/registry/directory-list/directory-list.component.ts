import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DirectoryFormComponent } from '../directory-form/directory-form.component';
import { DirectoryEntity } from '../../app/model/registry/directory.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { FlagEntity } from '../../app/model/settings/flag.entity';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { DirectorySettingsComponent } from '../directory-settings/directory-settings.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DirectoryHistoryComponent } from '../directory-history/directory-history.component';

@Component({
  selector: 'app-registry-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.css'],
})
export class DirectoryListComponent implements OnInit {

  list: { [key: string]: string }[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  activeFlags: { [key: string]: string[] } = {};
  flagList: Array<FlagEntity> = [];
  attributeList: string[] = [];
  columns: string[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
    private router: Router,
    private messageBar: MatSnackBar,
  ) {
  }

  getColumns() {
    return [
      'select',
      'action',
      'moveto',
      'flags',
      ...this.columns,
    ];
  }

  /**
   *
   */
  isAllSelected() {
    return this.selection.selected.length === this.list.length;
  }

  /**
   *
   */
  toggleAllRows() {
    if (this.isAllSelected()) this.selection.clear();
    else this.selection.select(...this.list);
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
  getFlagsIcon(id: string) {
    const list = this.activeFlags[id];
    const icons: Array<{
      icon: string | null,
      title: string,
      color: string | null,
    }> = [];

    for (const flag of this.flagList) {
      if (list.includes(flag.id) && flag.icon) {
        icons.push({
          icon: flag.icon,
          title: flag.id,
          color: flag.color,
        });
      }
    }

    return icons;
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
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG),
      this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE),
      this.apiService.fetchList<DirectoryEntity>(ApiEntity.DIRECTORY, {
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      }),
      this.apiService.countData(ApiEntity.DIRECTORY),
    ]).then(([flagList, AttributeList, data, count]) => {

      console.log(data);
      this.flagList = flagList;
      this.attributeList = AttributeList.map((item: { id: string }) => item.id);
      this.setData(data);
      this.totalCount = count;

      this.selection.clear();
    });
  }

  /**
   *
   */
  private setData(data: DirectoryEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

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

      this.list.push(line);
    }

    this.columns = ['id', 'created_at', 'updated_at', ...col];
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      DirectoryFormComponent,
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
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  onNext(id: string) {
    this.router.navigate(
      ['/directory', id],
      {},
    );
  }

  /**
   *
   */
  toggleFlag(id: number, flag: string) {
    const list: Array<string> = [...this.activeFlags[id]];

    const index = this.activeFlags[id].indexOf(flag);
    if (~index) {
      list.splice(index, 1);
    } else {
      list.push(flag);
    }

    this.apiService.patchData(ApiEntity.DIRECTORY, id, {flag: list})
      .then(() => {
        this.messageBar.open(`Changing flag ${flag} for ${id}`, 'close', {duration: 3000});
        return this.refreshData();
      })
      .catch(err => this.messageBar.open(err, 'close', {duration: 3000}));
  }

  /**
   *
   */
  async deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.DIRECTORY, list)
      .then(() => {
        this.messageBar.open(`Directories ${list.join(', ')} deleted`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.DIRECTORY, [id])
      .then(() => {
        this.messageBar.open(`Directory ${id} deleted`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      DirectorySettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  openHistory(id: string) {
    this.dialog.open(
      DirectoryHistoryComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
