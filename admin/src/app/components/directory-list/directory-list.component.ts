import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DirectoryFormComponent } from '../directory-form/directory-form.component';
import { Directory } from '../../model/directory';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Observable } from 'rxjs';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-directory-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.css'],
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

  fetchList(args: StringifiableRecord) {
    this.apiService.fetchList<Directory>(ApiEntity.DIRECTORY, args)
      .then(list => this.setData(list));

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

    this.columns = ['select', 'action', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    return dialog.afterClosed();
  }

  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {

  }

}
