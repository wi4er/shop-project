import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Flag } from '../../model/settings/flag';
import { Property } from '../../model/settings/property';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-common-list',
  templateUrl: './common-list.component.html',
  styleUrls: ['./common-list.component.css'],
})
export class CommonListComponent implements OnInit {

  @Input()
  list: { [key: string]: string }[] = [];

  @Input()
  entity: string = '';

  pageEvent?: PageEvent;

  @Input()
  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  @Input()
  activeFlags: { [key: string]: string[] } = {};

  propertyList: string[] = ['NAME'];
  flagList: string[] = [];

  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  @Input()
  columns: string[] = [];

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

    this.fetchList([
      `limit=${this.pageSize}`,
      `offset=${this.currentPage * this.pageSize}`,
    ]);
  }

  constructor(
    private apiService: ApiService,
  ) {

  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchData<Flag>(ApiEntity.FLAG)
        .then(list => this.flagList = list.map((it: { id: string }) => it.id)),
      this.apiService.fetchData<Property>(ApiEntity.PROPERTY)
        .then(list => this.propertyList = list.map((item: { id: string }) => item.id)),
    ]).then(() => this.fetchList([
      `limit=${this.pageSize}`,
      `offset=${this.currentPage * this.pageSize}`,
    ]));
  }

  refreshData() {
    this.fetchList([
      `limit=${this.pageSize}`,
      `offset=${this.currentPage * this.pageSize}`,
    ]);
  }

  @Input()
  fetchList(args: string[] = []) {
  }

  @Input()
  // @ts-ignore
  onAddItem(): Observable<undefined> {
  }

  addItem() {
    this.onAddItem()
      .subscribe(() => this.refreshData());
  }

  @Input()
  // @ts-ignore
  onUpdateItem(id: number): Observable<undefined> {
  }

  updateItem(id: number) {
    this.onUpdateItem(id)
      .subscribe(() => this.refreshData());
  }

  @Input()
  toggleFlag(id: number, flag: string) {
    console.log(id, '>>>>>>>', flag);
  }

  @Input()
  deleteList() {
  }

  @Input()
  deleteItem(id: string) {
    console.log(`DELETE >>>> ${id}`);
  }

}
