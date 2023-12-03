import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ElementFormComponent } from '../element-form/element-form.component';
import { Element } from '../../model/content/element';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Observable } from 'rxjs';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-element-list',
  templateUrl: './element-list.component.html',
  styleUrls: ['./element-list.component.css'],
})
export class ElementListComponent implements OnChanges {

  @Input()
  blockId: number = 0;

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  totalCount: number = 0;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    // this.fetchList();
  }

  fetchList(args: StringifiableRecord = {}) {
    this.apiService.fetchData<Element>(ApiEntity.ELEMENT, {...args, ['filter[block]']: this.blockId})
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.ELEMENT, {...args, ['filter[block]']: this.blockId})
      .then(count => this.totalCount = count);
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

      for (const it of item.property) {
        col.add('property_' + it.property);
        line['property_' + it.property] = it.string;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['select', 'action', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      ElementFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {block: this.blockId},
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      ElementFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    return dialog.afterClosed();
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
