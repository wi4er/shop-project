import { Component, Input, OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FlagEntity } from '../../settings/model/flag.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { ElementEntity } from '../../app/model/content/element.entity';
import { MatDialog } from '@angular/material/dialog';
import { ElementFormComponent } from '../element-form/element-form.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BlockEntity } from '../../app/model/content/block.entity';
import { ElementSettingsComponent } from '../element-settings/element-settings.component';
import { PermissionValue } from '../../app/model/permission/permission-value';
import { PermissionMethod } from '../../app/model/permission/permission-method';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElementHistoryComponent } from '../element-history/element-history.component';
import { DateService } from '../../app/service/date.service';

@Component({
  selector: 'content-element-list',
  templateUrl: './element-list.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*', minHeight: '120px'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrls: ['./element-list.component.css'],
})
export class ElementListComponent implements OnChanges {

  loading: boolean = true;

  @Input()
  blockId?: string;
  blockName?: string;

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  activeFlags: { [key: string]: string[] } = {};
  attributeList: string[] = [];
  flagList: Array<FlagEntity> = [];
  permissionList: { [key: string]: Array<PermissionValue> } = {};
  imageList: {
    [id: string]: Array<{
      path: string,
      collection: string,
    }> | null
  } = {};
  columns: string[] = [];

  list: { [key: string]: string }[] = [];
  expandedElement: ElementEntity | null = null;

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
  getColumns() {
    return [
      'select',
      'action',
      'publish',
      'flags',
      'created_at',
      'updated_at',
      ...this.columns,
      'image',
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
  ngOnChanges() {
    this.refreshData();
  }

  /**
   *
   */
  private setData(data: ElementEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.imageList = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        id: String(item.id),
        sort: String(item.sort),
        created_at: item.created_at,
        updated_at: item.updated_at,
        path: item.image[0]?.path ?? '',
      };

      for (const image of item.image) {
        if (!this.imageList[item.id]) this.imageList[item.id] = [];
        this.imageList[item.id]?.push(image);
      }

      for (const it of item.attribute) {
        col.add('attribute_' + it.attribute);
        if ('string' in it) {
          line['attribute_' + it.attribute] = it.string;
        } else  if ('description' in it) {
          line['attribute_' + it.attribute] = it.description;
        } else if ('from' in it) {
          line['attribute_' + it.attribute] = it.from + (it.to ? ' - ' + it.to : '');
        }
      }

      this.activeFlags[item.id] = item.flag;
      this.permissionList[item.id] = item.permission;
      this.list.push(line);
    }

    this.columns = ['id', 'sort', ...col];
  }

  /**
   *
   */
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG),
      this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE),
      this.blockId ? this.apiService.fetchItem<BlockEntity>(ApiEntity.BLOCK, String(this.blockId)) : null,
      this.apiService.fetchList<ElementEntity>(
        ApiEntity.ELEMENT,
        {
          'filter[block]': this.blockId,
          'sort[sort]': 'asc',
          'sort[created_at]': 'desc',
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(
        ApiEntity.ELEMENT,
        {['filter[block]']: this.blockId},
      ),
    ]).then(([flagList, attributeList, blockItem, data, count]) => {
      this.flagList = flagList;
      this.attributeList = attributeList.map((item: { id: string }) => item.id);
      // this.blockName = blockItem?.attribute.find(item => item.attribute === 'NAME')?.string;
      this.setData(data);
      this.totalCount = count;

      this.selection.clear();
      this.loading = false;
    });
  }

  /**
   *
   */
  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.ELEMENT, list)
      .then(() => this.refreshData());
  }

  /**
   *
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.ELEMENT, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      ElementFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {block: this.blockId},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  updateItem(id: number) {
    this.dialog.open(
      ElementFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {block: this.blockId, id},
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

    this.apiService.patchData(ApiEntity.ELEMENT, id, {flag: list})
      .then(() => {
        this.messageBar.open(`Changing flag ${flag} for ${id}`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  publishItem(id: string) {
    this.apiService.patchData(
      ApiEntity.ELEMENT,
      id,
      {permission: [...this.permissionList[id], {method: PermissionMethod.READ}]},
    ).then(() => {
      this.messageBar.open(`Published ${id}`, 'close', {duration: 1500});
      return this.refreshData();
    }).catch(err => {
      this.messageBar.open(err, 'close', {duration: 5000});
    });
  }

  /**
   *
   */
  canPublishItem(id: string) {
    return !!this.permissionList[id].find(it => {
      return it.method === 'READ' && !it.group;
    });
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      ElementSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {block: this.blockId},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  openHistory(id: string) {
    this.dialog.open(
      ElementHistoryComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
