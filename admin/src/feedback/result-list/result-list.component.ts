import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FormFormComponent } from '../form-form/form-form.component';
import { ResultEntity } from '../model/result.entity';
import { StringifiableRecord } from 'query-string/base';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css'],
})
export class ResultListComponent {

  list: { [key: string]: string }[] = [];
  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  totalCount: number = 0;
  formId: string;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {
    this.formId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.route.paramMap
      .subscribe(value => {
        this.formId = value.get('id') ?? '';

        this.apiService.fetchList<ResultEntity>(ApiEntity.RESULT, {['filter[form]']: this.formId})
          .then(list => this.setData(list));

        this.apiService.countData(ApiEntity.RESULT)
          .then(count => this.totalCount = count);
      });
  }

  fetchList(args: StringifiableRecord) {
    this.apiService.fetchList<ResultEntity>(ApiEntity.RESULT, {['filter[form]']: this.formId, ...args})
      .then(list => this.setData(list));

    this.apiService.countData(ApiEntity.RESULT)
      .then(count => this.totalCount = count);
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: ResultEntity[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      this.list.push(line);
    }

    this.columns = ['select', 'action', 'id', 'created_at', 'updated_at', ...col];
  }

  addItem(): Observable<undefined> {
    const dialog = this.dialog.open(
      FormFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    return dialog.afterClosed();
  }

  updateItem(id: number): Observable<undefined> {
    const dialog = this.dialog.open(
      FormFormComponent,
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
  }

}
