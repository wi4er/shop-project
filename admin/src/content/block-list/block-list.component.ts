import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Router } from '@angular/router';
import { BlockEntity } from '../../app/model/content/block.entity';
import { BlockFormComponent } from '../block-form/block-form.component';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { FlagEntity } from '../../app/model/settings/flag.entity';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { DomSanitizer } from '@angular/platform-browser';
import { BlockSettingsComponent } from '../block-settings/block-settings.component';
import { DateService } from '../../app/service/date.service';
import { BlockHistoryComponent } from '../block-history/block-history.component';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.css'],
})
export class BlockListComponent implements OnInit {

  @Input()
  list: { [key: string]: string }[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  activeFlags: { [key: string]: string[] } = {};
  propertyList: string[] = [];
  flagList: Array<FlagEntity> = [];
  columns: string[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
    private router: Router,
    public dateService: DateService,
  ) {
  }

  /**
   *
   */
  getColumns() {
    return [
      'select',
      'action',
      'moveto',
      'flags',
      'created_at',
      'updated_at',
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
    Promise.all([
      this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG)
        .then(list => this.flagList = list),
      this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE)
        .then(list => this.propertyList = list.map((item: { id: string }) => item.id)),
    ]).then(() => this.refreshData());
  }

  /**
   *
   */
  refreshData() {
    Promise.all([
      this.apiService.fetchList<BlockEntity>(ApiEntity.BLOCK, {
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      }).then(list => this.setData(list)),
      this.apiService.countData(ApiEntity.BLOCK)
        .then(count => this.totalCount = count),
    ]).then(() => this.selection.clear());
  }

  /**
   *
   */
  private setData(data: BlockEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        id: String(item.id),
        sort: String(item.sort),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const it of item.attribute) {
        col.add('attribute_' + it.attribute);
        if ('string' in it) {
          line['attribute_' + it.attribute] = it.string;
        } else if ('from' in it) {
          line['attribute_' + it.attribute] = it.from + ' - ' + it.to;
        }
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['id', 'sort', ...col];
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      BlockFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  deleteItem(id: number) {
    this.apiService.deleteList(ApiEntity.BLOCK, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.BLOCK, list)
      .then(() => this.refreshData());
  }

  /**
   *
   */
  updateItem(id: number) {
    this.dialog.open(
      BlockFormComponent,
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
      ['/content', id],
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

    this.apiService.patchData(ApiEntity.BLOCK, id, {flag: list})
      .then(() => this.refreshData());
  }

  /**
   *
   */
  openSettings() {
   this.dialog.open(
      BlockSettingsComponent,
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
      BlockHistoryComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
