import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Collection } from '../../app/model/storage/collection';

@Component({
  selector: 'app-dashboard-collection',
  templateUrl: './dashboard-collection.component.html',
  styleUrls: ['./dashboard-collection.component.css'],
})
export class DashboardCollectionComponent implements OnInit {

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
      ['collection', id],
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

  protected readonly Object = Object;

}
