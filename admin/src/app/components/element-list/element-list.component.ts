import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonList } from '../../common-list/common-list';
import { ElementFormComponent } from '../element-form/element-form.component';
import { Element } from '../../model/element';
import { ApiEntity, ApiService } from '../../service/api.service';


@Component({
  selector: 'app-element-list',
  templateUrl: './element-list.component.html',
  styleUrls: ['./element-list.component.css'],
})
export class ElementListComponent
  extends CommonList
  implements OnInit {

  @Input()
  blockId: number = 0;

  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  propertyList: string[] = ['NAME'];
  flagList: string[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchList();
  }

  override fetchList() {
    this.apiService.fetchData(ApiEntity.ELEMENT)
      .then(list => this.setData(list as Element[]));

    this.apiService.fetchData(ApiEntity.FLAG)
      .then(list => this.flagList = list.map((it: { id: string }) => it.id));

    this.apiService.fetchData(ApiEntity.PROPERTY)
      .then(list => this.propertyList = list.map((item: { id: string }) => item.id));
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Element[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const fl of item.flag) {
        col.add('flag_' + fl);
        line['flag_' + fl] = fl;
      }

      for (const it of item.property) {
        col.add('property_' + it.property);
        line['property_' + it.property] = it.string;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['select', 'action', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem() {
    const dialog = this.dialog.open(
      ElementFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed()
      .subscribe(() => console.log('CLOSE'));
  }

  updateItem(id: number) {
    const dialog = this.dialog.open(
      ElementFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed()
      .subscribe(() => this.fetchList());
  }

  toggleFlag(id: number, flag: string) {
    console.log(id, '>>>>>>>', flag);
  }

  deleteList() {
  }

  deleteItem(id: string) {
    console.log(`DELETE >>>> ${id}`);
  }

}
