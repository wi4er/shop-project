import { Component, Inject, Input, OnInit } from '@angular/core';
import { DirectoryLog } from '../../app/model/registry/directory-log';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-directory-history',
  templateUrl: './directory-history.component.html',
  styleUrls: ['./directory-history.component.css'],
})
export class DirectoryHistoryComponent implements OnInit {

  directory: string;

  displayedColumns: string[] = ['id', 'field', 'from', 'to'];
  logList: Array<{ [field: string]: string }> = [];

  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
  ) {
    if (data?.id) {
      this.directory = data.id;
    } else {
      throw new Error('Directory id expected!');
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

  /**
   *
   */
  refreshData() {
    Promise.all([
      this.apiService.fetchList<DirectoryLog>(
        ApiEntity.DIRECTORY_LOG,
        {
          directory: this.directory,
          limit: this.pageSize,
          offset: this.currentPage * this.pageSize,
        },
      ),
      this.apiService.countData(
        ApiEntity.DIRECTORY_LOG,
        {directory: this.directory},
      ),
    ]).then(([logList, logCount]) => {
      this.totalCount = logCount;
      this.setData(logList);
    });
  }

  /**
   *
   */
  setData(list: Array<DirectoryLog>) {
    this.logList = [];

    for (const item of list) {
      this.logList.push({
        id: String(item.id),
        field: item.field,
        from: item.from,
        to: item.to,
      });
    }

    console.log(this.logList);
  }

}
