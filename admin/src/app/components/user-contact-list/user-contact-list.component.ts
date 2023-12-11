import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Observable } from 'rxjs';
import { Contact } from '../../model/user/contact';
import { UserContactFormComponent } from '../user-contact-form/user-contact-form.component';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-user-contact-list',
  templateUrl: './user-contact-list.component.html',
  styleUrls: ['./user-contact-list.component.css']
})
export class UserContactListComponent {

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
    this.apiService.fetchList<Contact>(ApiEntity.CONTACT, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.CONTACT)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Contact[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        type: item.type,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = ['select', 'action', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      UserContactFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      UserContactFormComponent,
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
