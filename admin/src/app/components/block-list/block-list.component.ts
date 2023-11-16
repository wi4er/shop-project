import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BlockFormComponent } from '../block-form/block-form.component';
import { CommonList } from '../../common-list/common-list';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Block } from '../../model/block';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.css'],
})
export class BlockListComponent
  extends CommonList
  implements OnInit {

  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  propertyList: string[] = [];
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
    this.apiService.fetchData(ApiEntity.BLOCK)
      .then(list => this.setData(list as Block[]));

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
  private setData(data: Block[]) {
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

    this.columns = [ 'select', 'action', 'id', 'created_at', 'updated_at', ...col, 'section', 'element' ];
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
      .subscribe(() => console.log('CLOSE'));
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
      .subscribe(() => this.fetchList());
  }

  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {

  }

}
