import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { Flag } from '../../app/model/settings/flag';
import { Attribute } from '../../app/model/settings/attribute';
import { CollectionFormComponent } from '../collection-form/collection-form.component';
import { Collection } from '../../app/model/storage/collection';
import { CollectionSettingsComponent } from '../collection-settings/collection-settings.component';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css']
})
export class CollectionListComponent implements OnInit {

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  activeFlags: { [key: string]: string[] } = {};
  propertyList: string[] = [];
  flagList: Array<Flag> = [];
  columns: string[] = [];
  list: { [key: string]: string }[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
  ) {
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
  isAllSelected() {
    return this.selection.selected.length === this.list.length;
  }

  /**
   *
   */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.list);
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
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Attribute>(ApiEntity.ATTRIBUTE),
      this.refreshData(),
    ]).then(([flagList, propertyList]) => {
      this.flagList = flagList;
      this.propertyList = propertyList.map((item: { id: string }) => item.id);
    });
  }

  /**
   *
   */
  private setData(data: Collection[]) {
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
        col.add('property_' + it.attribute);
        line['property_' + it.attribute] = it.string;
      }

      this.activeFlags[item.id] = item.flag;
      this.list.push(line);
    }

    this.columns = ['id', 'created_at', 'updated_at', ...col];
  }

  /**
   *
   */
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<Collection>(
        ApiEntity.COLLECTION,
        {
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(ApiEntity.COLLECTION),
    ]).then(([data, count]) => {
      this.setData(data);
      this.totalCount = count;
      this.selection.clear();
    });
  }

  /**
   *
   */
  updateItem(id: number) {
    this.dialog.open(
      CollectionFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData())
  }

  /**
   *
   */
  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.COLLECTION, list)
      .then(() => this.refreshData());
  }

  /**
   *
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.COLLECTION, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      CollectionFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  toggleFlag(id: number, flag: string) {
    console.log(id, '>>>>>>>', flag);
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      CollectionSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
