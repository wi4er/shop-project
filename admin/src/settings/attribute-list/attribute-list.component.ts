import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AttributeFormComponent } from '../attribute-form/attribute-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { FlagEntity } from '../../app/model/settings/flag.entity';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateService } from '../../app/service/date.service';
import { AttributeHistoryComponent } from '../attribute-history/attribute-history.component';
import { AttributeSettingsComponent } from '../attribute-settings/attribute-settings.component';

@Component({
  selector: 'app-attribute-list',
  templateUrl: './attribute-list.component.html',
  styleUrls: ['./attribute-list.component.css']
})
export class AttributeListComponent implements OnInit {

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  flagList: Array<FlagEntity> = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
    private messageBar: MatSnackBar,
    public dateService: DateService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG),
      this.refreshData(),
    ]).then(([flagList]) => {
      this.flagList = flagList;
    });
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
  getColumns() {
    return [
      'select',
      'action',
      'flags',
      'created_at',
      'updated_at',
      ...this.columns,
    ];
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
      this.apiService.fetchList<AttributeEntity>(
        ApiEntity.ATTRIBUTE,
        {
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(ApiEntity.ATTRIBUTE),
    ]).then(([data, count]) => {
      this.setData(data);
      this.totalCount = count;
      this.selection.clear();
    });
  }

  /**
   *
   */
  private setData(data: AttributeEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
        type: item.type,
        link: item.directory || item.collection || item.block || '',
      };

      for (const it of item.attribute) {
        col.add('property_' + it.attribute);
        if ('string' in it) {
          line['attribute_' + it.attribute] = it.string;
        } else if ('from' in it) {
          line['attribute_' + it.attribute] = it.from + ' - ' + it.to;
        }
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = [ 'id', 'type', 'link', ...col ];
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      AttributeFormComponent,
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
      AttributeFormComponent,
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
  toggleFlag(id: string, flag: string) {
    const list: Array<string> = [...this.activeFlags[id]];

    const index = this.activeFlags[id].indexOf(flag);
    if (~index) {
      list.splice(index, 1);
    } else {
      list.push(flag);
    }

    this.apiService.patchData(ApiEntity.ATTRIBUTE, id, {flag: list})
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

    this.apiService.deleteList(ApiEntity.ATTRIBUTE, list)
      .then(() => this.refreshData());
  }

  /**
   *
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.ATTRIBUTE, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      AttributeSettingsComponent,
      {
        width: '500px',
        panelClass: 'wrapper',
        data: {},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  openHistory(id: string) {
    this.dialog.open(
      AttributeHistoryComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
