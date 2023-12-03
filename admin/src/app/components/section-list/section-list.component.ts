import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Section } from '../../model/content/section';
import { SectionFormComponent } from '../section-form/section-form.component';
import { Observable } from 'rxjs';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.css'],
})
export class SectionListComponent implements OnInit {

  @Input()
  blockId: number = 0;

  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  list: { [key: string]: string }[] = [];
  totalCount: number = 0;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {
  }

  ngOnInit() {
  }

  fetchList(args: StringifiableRecord) {
    this.apiService.fetchData<Section>(ApiEntity.SECTION, {...args, ['filter[block]=']: this.blockId})
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.SECTION)
      .then(count => this.totalCount = count);
  }

  private setData(data: Section[]) {
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
      SectionFormComponent,
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
      SectionFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id, block: this.blockId},
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
