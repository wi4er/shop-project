import { Component, Input, OnChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Flag } from '../../app/model/settings/flag';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Attribute } from '../../app/model/settings/attribute';
import { Directory } from '../../app/model/registry/directory';
import { PointSettingsComponent } from '../point-settings/point-settings.component';
import { PointFormComponent } from '../point-form/point-form.component';
import { Point } from '../../app/model/registry/point';

@Component({
  selector: 'app-point-list',
  templateUrl: './point-list.component.html',
  styleUrls: ['./point-list.component.css'],
})
export class PointListComponent implements OnChanges {

  @Input()
  directoryId: string = '';

  list: { [key: string]: string }[] = [];
  directoryItem?: Directory;

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  activeFlags: { [key: string]: string[] } = {};
  flagList: Array<Flag> = [];
  attributeList: string[] = [];
  columns: string[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
    private messageBar: MatSnackBar,
  ) {
  }

  /**
   *
   */
  ngOnChanges() {
    this.refreshData();
  }

  /**
   *
   */
  getColumns() {
    return [
      'select',
      'action',
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
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Attribute>(ApiEntity.ATTRIBUTE),
      this.apiService.fetchItem<Directory>(ApiEntity.DIRECTORY, this.directoryId),
      this.apiService.fetchList<Point>(ApiEntity.POINT, {
        directory: this.directoryId,
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      }),
      this.apiService.countData(ApiEntity.POINT),
    ]).then(([flagList, AttributeList, directoryItem, data, count]) => {
      this.flagList = flagList;
      this.attributeList = AttributeList.map((item: { id: string }) => item.id);
      this.directoryItem = directoryItem;
      this.setData(data);
      this.totalCount = count;

      this.selection.clear();
    });
  }

  /**
   *
   */
  private setData(data: Point[]) {
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
      PointFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {directory: this.directoryId},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  updateItem(id: number) {
    this.dialog.open(
      PointFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id, directoryId: this.directoryId},
      },
    ).afterClosed().subscribe(() => this.refreshData());
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

    this.apiService.patchData(ApiEntity.POINT, id, {flag: list})
      .then(() => {
        this.messageBar.open(`Changing flag ${flag} for ${id}`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  async deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.POINT, list)
      .then(() => {
        this.messageBar.open(`Directories ${list.join(', ')} deleted`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.POINT, [id])
      .then(() => {
        this.messageBar.open(`Point ${id} deleted`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      PointSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
