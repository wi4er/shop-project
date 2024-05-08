import { Component, Input, SimpleChanges } from '@angular/core';
import { Flag } from '../../app/model/settings/flag';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Property } from '../../app/model/settings/property';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Section } from '../../app/model/content/section';
import { SectionFormComponent } from '../section-form/section-form.component';
import { Element } from '../../app/model/content/element';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
  styleUrls: ['./section-list.component.css']
})
export class SectionListComponent {

  @Input()
  blockId?: number;

  list: { [key: string]: string }[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  activeFlags: { [key: string]: string[] } = {};

  propertyList: string[] = [];
  flagList: string[] = [];
  imageList: {
    [id: string]: Array<{
      path: string,
    }> | null
  } = {};
  columns: string[] = [];

  selection = new SelectionModel<{ [key: string]: string }>(true, []);
  expandedElement: Element | null = null;

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

  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<Section>(
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

  private setData(data: Section[]) {
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

      for (const it of item.property) {
        col.add('property_' + it.property);
        line['property_' + it.property] = it.string;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['id', 'created_at', 'updated_at', 'sort', ...col];
  }

  deleteList() {
    const list = this.selection.selected.map(item => item['id']);

    this.apiService.deleteList(ApiEntity.ELEMENT, list)
      .then(() => this.refreshData());
  }

  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.ELEMENT, [id])
      .then(() => this.refreshData());
  }

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

  toggleFlag(id: number, flag: string) {
    console.log(id, '>>>>>>>', flag);
  }

}
