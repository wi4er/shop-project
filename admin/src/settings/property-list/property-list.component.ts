import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PropertyFormComponent } from '../property-form/property-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Property } from '../../app/model/settings/property';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit {

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  flagList: string[] = [];

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

  getColumns() {
    return [
      'select',
      'action',
      ...this.columns,
    ];
  }

  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<Property>(
        ApiEntity.PROPERTY,
        {
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(ApiEntity.PROPERTY),
    ]).then(([data, count]) => {
      this.setData(data);
      this.totalCount = count;
      this.selection.clear();
    });
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Property[]) {
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
      PropertyFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  updateItem(id: number) {
    const dialog = this.dialog.open(
      PropertyFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  toggleFlag(id: number, flag: string) {
  }

  async deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.PROPERTY, list)
      .then(() => this.refreshData());
  }

  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.PROPERTY, [id])
      .then(() => this.refreshData());
  }

}
