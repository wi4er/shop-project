import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Observable } from 'rxjs';
import { Group } from '../../app/model/user/group';
import { GroupFormComponent } from '../group-form/group-form.component';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-user-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent {

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
    this.apiService.fetchList<Group>(ApiEntity.GROUP, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.GROUP)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Group[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        id: String(item.id),
        parent: String(item.parent ?? ''),
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

    this.columns = ['id', 'parent', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      GroupFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      GroupFormComponent,
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

  async deleteList() {
  }

  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.GROUP, [id])
      .then(res => {
        console.log(res);
      })
  }
}
