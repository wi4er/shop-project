import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DirectoryFormComponent } from '../directory-form/directory-form.component';
import { Directory } from '../../model/directory';
import { ApiEntity, ApiService } from '../../service/api.service';

@Component({
  selector: 'app-directory-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.css']
})
export class DirectoryListComponent implements OnInit {

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
    this.apiService.fetchData(ApiEntity.DIRECTORY, [...args])
      .then(list => this.setData(list as Directory[]));

    this.apiService.countData(ApiEntity.DIRECTORY)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Directory[]) {
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

    this.columns = [ 'select', 'action', 'id', 'created_at', 'updated_at', ...col ];
  }

  addItem() {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
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
      DirectoryFormComponent,
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
