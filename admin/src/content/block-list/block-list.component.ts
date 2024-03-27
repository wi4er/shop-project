import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Router } from '@angular/router';
import { StringifiableRecord } from 'query-string/base';
import { Block } from '../../app/model/content/block';
import { BlockFormComponent } from '../block-form/block-form.component';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Flag } from '../../app/model/settings/flag';
import { Property } from '../../app/model/settings/property';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.css']
})
export class BlockListComponent {


  @Input()
  list: { [key: string]: string }[] = [];

  pageEvent?: PageEvent;

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  activeFlags: { [key: string]: string[] } = {};

  propertyList: string[] = [];
  flagList: string[] = [];

  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  columns: string[] = [];

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
    this.pageEvent = event;
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.fetchList({
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
    });
  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Flag>(ApiEntity.FLAG)
        .then(list => this.flagList = list.map((it: { id: string }) => it.id)),
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY)
        .then(list => this.propertyList = list.map((item: { id: string }) => item.id)),
    ]).then(() => {
      this.fetchList({
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      })
    });
  }

  refreshData() {
    this.fetchList({
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
    });

    this.selection.clear();
  }

  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.BLOCK, list)
      .then(() => this.refreshData());
  }

  fetchList(args: StringifiableRecord) {
    this.apiService.fetchList<Block>(ApiEntity.BLOCK, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.BLOCK)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Block[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        id: String(item.id),
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

    this.columns = ['id', 'created_at', 'updated_at', ...col];
  }

  addItem() {
    const dialog = this.dialog.open(
      BlockFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed()
      .subscribe(() => this.refreshData());
  }

  deleteItem(id: number) {
    this.apiService.deleteList(ApiEntity.BLOCK, [id])
      .then(() => this.refreshData());
  }

  updateItem(id: number) {
    const dialog = this.dialog.open(
      BlockFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed()
      .subscribe(() => this.refreshData());
  }

  onNext(id: string) {
    this.router.navigate(
      ['/content', id],
      {},
    );
  }


  toggleFlag(id: number, flag: string) {
  }

}
