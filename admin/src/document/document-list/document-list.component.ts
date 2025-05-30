import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Observable } from 'rxjs';
import { Document } from '../../app/model/document';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { Router } from '@angular/router';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-bundle-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent {

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  totalCount: number = 0;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  fetchList(args: StringifiableRecord) {
    this.apiService.fetchList<Document>(ApiEntity.DOCUMENT, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.DOCUMENT)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Document[]) {
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
        col.add('property_' + it.attribute);
        line['property_' + it.attribute] = it.string;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['select', 'action', 'moveto', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      DocumentFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      DocumentFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    return dialog.afterClosed();
  }

  goNext(id: string) {
    this.router.navigate(
      ['/document', id],
      {},
    );
  }

  toggleFlag(id: number, flag: string) {
  }

  async deleteList() {
  }

  deleteItem(id: string) {
  }

}
