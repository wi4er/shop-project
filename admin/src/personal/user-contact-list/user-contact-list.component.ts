import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Contact } from '../../app/model/user/contact';
import { UserContactFormComponent } from '../user-contact-form/user-contact-form.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from '@angular/material/paginator';
import { UserContactSettingsComponent } from '../user-contact-settings/user-contact-settings.component';

@Component({
  selector: 'app-user-contact-list',
  templateUrl: './user-contact-list.component.html',
  styleUrls: ['./user-contact-list.component.css']
})
export class UserContactListComponent implements OnInit {

  contactList: { [key: string]: string }[] = [];
  flagList: string[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit(): void {
    this.refreshData();
  }

  isAllSelected() {
    return this.selection.selected.length === this.contactList.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.contactList);
    }
  }

  /**
   *
   */
  changePage(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.refreshData();
  }

  /**
   *
   */
  getColumns() {
    return [
      'select',
      'action',
      ...this.columns,
    ];
  }

  /**
   *
   */
  async refreshData() {
    return Promise.all([
      this.apiService.fetchList<Contact>(ApiEntity.CONTACT),
      this.apiService.countData(ApiEntity.CONTACT),
    ]).then(([contacts, count]) => {
      this.setData(contacts);
      this.totalCount = count;
    });
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Contact[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.contactList = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        type: item.type,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const it of item.property) {
        col.add('property_' + it.property);
        line['property_' + it.property] = it.string;
      }

      this.activeFlags[item.id] = item.flag;
      this.contactList.push(line);
    }

    this.columns = ['id', 'type', 'created_at', 'updated_at', ...col];
  }

  /**
   *
   */
  addItem() {
    this.dialog.open(
      UserContactFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  updateItem(id: number) {
    this.dialog.open(
      UserContactFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  toggleFlag(id: number, flag: string) {

  }

  /**
   *
   */
  async deleteList() {
    this.apiService.deleteList(
      ApiEntity.CONTACT,
      this.selection.selected.map(item => item['id']),
    ).then(() => this.refreshData());
  }

  /**
   *
   * @param id
   */
  deleteItem(id: string) {
    this.apiService.deleteList(ApiEntity.CONTACT, [id])
      .then(() => this.refreshData());
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      UserContactSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

}
