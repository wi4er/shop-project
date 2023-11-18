import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FlagFormComponent } from '../flag-form/flag-form.component';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Flag } from '../../model/flag';

@Component({
  selector: 'app-flag-list',
  templateUrl: './flag-list.component.html',
  styleUrls: ['./flag-list.component.css'],
})
export class FlagListComponent implements OnInit {

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  totalCount: number = 0;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {
  }

  ngOnInit(): void {
  }

  fetchList(args: string[] = []) {
    this.apiService.fetchData(ApiEntity.FLAG, [...args])
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.FLAG)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Flag[]) {
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

  addItem() {
    const dialog = this.dialog.open(
      FlagFormComponent,
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
      FlagFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed()
      .subscribe(() => console.log('CLOSE'));
  }

  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {
  }

}
