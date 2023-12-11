import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BlockFormComponent } from '../block-form/block-form.component';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Block } from '../../model/content/block';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.css'],
})
export class BlockListComponent implements OnInit {

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
    this.apiService.fetchList<Block>(ApiEntity.BLOCK, args)
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.BLOCK)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Block[]) {
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

    this.columns = ['select', 'action', 'moveto', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      BlockFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      BlockFormComponent,
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
      ['/content', id],
      {},
    );
  }


  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {
  }

}
