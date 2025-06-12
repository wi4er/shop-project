import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LangEntity } from '../../app/model/settings/lang.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { LangFormComponent } from '../lang-form/lang-form.component';
import { Observable } from 'rxjs';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-lang-list',
  templateUrl: './lang-list.component.html',
  styleUrls: ['./lang-list.component.css']
})
export class LangListComponent implements OnInit {

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
    this.apiService.fetchList<LangEntity>(ApiEntity.LANG, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.LANG)
      .then(count => this.totalCount = count);
  }

  /**
   *
   */
  private setData(data: LangEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const it of item.attribute) {
        col.add('attribute_' + it.attribute);
        line['attribute_' + it.attribute] = it.string;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = [ 'select', 'action', 'id', 'created_at', 'updated_at', ...col ];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      LangFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      LangFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    return dialog.afterClosed()
  }

  toggleFlag(id: number, flag: string) {
  }

  async deleteList() {
  }

  deleteItem(id: string) {
  }

}
