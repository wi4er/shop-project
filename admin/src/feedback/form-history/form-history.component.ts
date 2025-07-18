import { Component, Inject, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DirectoryLog } from '../../app/model/registry/directory-log';
import { FormLogEntity } from '../model/form-log.entity';
import { StringifiableRecord } from 'query-string/base';
import qs from 'query-string';

@Component({
  selector: 'app-form-history',
  templateUrl: './form-history.component.html',
  styleUrls: ['./form-history.component.css'],
})
export class FormHistoryComponent implements OnInit {

  formId: string;

  displayedColumns: string[] = ['version', 'items'];
  logList: Array<{ [field: string]: string }> = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string } | null,
  ) {
    if (data?.id) {
      this.formId = data.id;
    } else {
      throw new Error('DirectoryEntity id expected!');
    }
  }

  ngOnInit() {
    this.refreshData();
  }

  /**
   *
   */
  changePage(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.refreshData();
  }

  fetchList<T>(): Promise<T[]> {
    const url = qs.stringifyUrl({
      url: `http://localhost:3030/feedback/form-log/${this.formId}`,
      query: {
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      },
    }, {sort: false});

    const req = fetch(url, {
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
    }).then(res => {
      if (!res.ok) throw new Error('Api not found!');
      return res.json();
    });

    req.catch(err => console.log(err));

    return req;
  }

  async fetchCount(): Promise<number> {
    const url = qs.stringifyUrl({
      url: `http://localhost:3030/feedback/form-log/${this.formId}/count`,
      query: {
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      },
    }, {sort: false});

    const req = fetch(url, {
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
    }).then(res => {
      if (!res.ok) throw new Error('Api not found!');
      return res.json() as Promise<{count: number}>;
    });

    req.catch(err => console.log(err));

    return req.then(count => count.count);
  }

  /**
   *
   */
  refreshData() {
    Promise.all([
      this.fetchList<FormLogEntity>(),
      this.fetchCount(),
    ]).then(([logList, logCount]) => {
      console.log(logList);

      this.totalCount = logCount;
      this.setData(logList);
    });
  }

  /**
   *
   */
  setData(list: Array<FormLogEntity>) {
    this.logList = [];

    for (const item of list) {
      this.logList.push({
        version: String(item.version),
        items: String(item.items.length),
      });
    }
  }

}
