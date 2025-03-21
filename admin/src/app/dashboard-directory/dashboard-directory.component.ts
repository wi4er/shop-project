import { Component } from '@angular/core';
import { ApiEntity, ApiService } from '../service/api.service';
import { Router } from '@angular/router';
import { Collection } from '../model/storage/collection';

@Component({
  selector: 'app-dashboard-directory',
  templateUrl: './dashboard-directory.component.html',
  styleUrls: ['./dashboard-directory.component.css']
})
export class DashboardDirectoryComponent {

  list: {
    [key: string]: {
      id: string;
      count: number;
    }
  } = {};

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
  }

  handleEdit() {
    console.log('EDIT');
  }

  handleMove(id: string) {
    this.router.navigate(
      ['directory', id],
      {},
    );
  }

  ngOnInit() {
    this.apiService.fetchList<Collection>(ApiEntity.COLLECTION)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
          count: 0,
        };

        this.apiService.countData(ApiEntity.FILE, {['filter[collection]']: it.id})
          .then(count => {
            this.list[it.id].count = count;
          });
      }));
  }

}
