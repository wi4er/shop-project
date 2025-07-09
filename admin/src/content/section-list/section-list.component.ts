import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FlagEntity } from '../../settings/model/flag.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { SectionEntity } from '../../app/model/content/section.entity';
import { SectionFormComponent } from '../section-form/section-form.component';
import { ElementEntity } from '../../app/model/content/element.entity';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SectionSettingsComponent } from '../section-settings/section-settings.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElementHistoryComponent } from '../element-history/element-history.component';
import { SectionHistoryComponent } from '../section-history/section-history.component';
import { DateService } from '../../app/service/date.service';

@Component({
  selector: 'content-section-list',
  templateUrl: './section-list.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*', minHeight: '120px'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrls: ['./section-list.component.css'],
})
export class SectionListComponent implements OnChanges {

  loading: boolean = true;

  @Input()
  blockId?: string;
  list: { [key: string]: string }[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  activeFlags: { [key: string]: string[] } = {};

  attributeList: string[] = [];
  flagList: Array<FlagEntity> = [];
  imageList: {
    [id: string]: Array<{
      path: string,
    }> | null
  } = {};
  columns: string[] = [];

  selection = new SelectionModel<{ [key: string]: string }>(true, []);
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
    Promise.all([
      this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG),
      this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE),
      this.refreshData(),
    ]).then(([flagList, attributeList]) => {
      this.flagList = flagList;
      this.attributeList = attributeList.map((item: { id: string }) => item.id);

      this.loading = false;
    });
  }

  /**
   *
   */
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<SectionEntity>(
        ApiEntity.SECTION,
        {
          'filter[block]': this.blockId,
          'sort[sort]': 'desc',
          'sort[created_at]': 'desc',
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(
        ApiEntity.SECTION,
        {['filter[block]']: this.blockId},
      ),
    ]).then(([data, count]) => {
      this.setData(data);
      this.totalCount = count;
    });
  }

  /**
   *
   */
  private setData(data: SectionEntity[]) {
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

      for (const image of item.image) {
        if (!this.imageList[item.id]) this.imageList[item.id] = [];
        this.imageList[item.id]?.push(image);
      }

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
  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.SECTION, list)
      .then(() => this.refreshData());
  }

  /**
   *
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.SECTION, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  updateItem(id: number) {
    const dialog = this.dialog.open(
      SectionFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {block: this.blockId, id},
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  addItem() {
    const dialog = this.dialog.open(
      SectionFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {block: this.blockId},
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
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

    this.apiService.patchData(ApiEntity.SECTION, id, {flag: list})
      .then(() => {
        this.messageBar.open(`Changing flag ${flag} for ${id}`, 'close', {duration: 3000});
        return this.refreshData();
      });
  }

  /**
   *
   */
  openSettings() {
    const dialog = this.dialog.open(
      SectionSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  openHistory(id: string) {
    this.dialog.open(
      SectionHistoryComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
