import { Component, OnInit } from '@angular/core';
import { CommonList } from '../../common-list/common-list';
import { MatDialog } from '@angular/material/dialog';
import { DirectoryFormComponent } from '../directory-form/directory-form.component';
import { Directory } from '../../model/directory';
import { ApiEntity, ApiService } from '../../service/api.service';

@Component({
  selector: 'app-directory-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.css']
})
export class DirectoryListComponent
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
    this.apiService.fetchData(ApiEntity.DIRECTORY)
      .then(list => this.setData(list as Directory[]));

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
      .subscribe(() => this.fetchList());
  }

  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {

  }

}
