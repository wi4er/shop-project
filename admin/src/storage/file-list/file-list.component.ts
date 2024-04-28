import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { Flag } from '../../app/model/settings/flag';
import { Property } from '../../app/model/settings/property';
import { FileFormComponent } from '../file-form/file-form.component';
import { File } from '../../app/model/storage/file';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css'],
})
export class FileListComponent implements OnChanges {

  @Input()
  collectionId?: string;

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  activeFlags: { [key: string]: string[] } = {};
  propertyList: string[] = [];
  flagList: string[] = [];
  columns: string[] = [];
  list: { [key: string]: string }[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
  ) {
  }

  getColumns() {
    return [
      'select',
      'action',
      ...this.columns,
      'image',
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

    this.refreshData();
  }

  ngOnChanges(changes: SimpleChanges) {
    Promise.all([
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.refreshData(),
    ]).then(([flagList, propertyList]) => {
      this.flagList = flagList.map((it: { id: string }) => it.id);
      this.propertyList = propertyList.map((item: { id: string }) => item.id);
    });
  }

  private setData(data: File[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
        collection: item.collection,
        path: item.path,
        mimetype: item.mimetype,
        original: item.original,
      };

      for (const it of item.property) {
        col.add('property_' + it.property);
        line['property_' + it.property] = it.string;
      }

      this.activeFlags[item.id] = item.flag;
      this.list.push(line);
    }

    this.columns = ['id', 'created_at', 'updated_at', 'mimetype', 'original', ...col];
  }

  refreshData(): Promise<void> {
    return Promise.all([
      this.apiService.fetchList<File>(
        ApiEntity.FILE,
        {
          ['filter[collection]']: this.collectionId,
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(
        ApiEntity.FILE,
        {['filter[collection]']: this.collectionId},
      ),
    ]).then(([data, count]) => {
      this.setData(data);
      this.totalCount = count;
      this.selection.clear();
    });
  }

  addItem() {
    const dialog = this.dialog.open(
      FileFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  updateItem(id: number) {
    const dialog = this.dialog.open(
      FileFormComponent,
      {
        data: {id},
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.FILE, list)
      .then(() => this.refreshData());
  }

  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.FILE, [id])
      .then(() => this.refreshData());
  }

  toggleFlag(id: number, flag: string) {
    console.log(id, '>>>>>>>', flag);
  }

}
