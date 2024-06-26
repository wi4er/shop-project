import { Component, OnInit } from '@angular/core';
import { Block } from '../model/content/block';
import { ApiEntity, ApiService } from '../service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css'],
})
export class DashboardContentComponent implements OnInit {

  list: {
    [id: string]: {
      id: number;
      section: number;
      element: number;
    }
  } = {};

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
  }

  handleEdit() {
    this.router.navigate(
      ['/content'],
      {},
    );
  }

  handleSettings() {
    console.log('EDIT');
  }

  handleMove(id: number) {
    this.router.navigate(
      ['/content', id],
      {},
    );
  }

  ngOnInit() {
    this.apiService.fetchList<Block>(ApiEntity.BLOCK)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
          section: 0,
          element: 0,
        };

        this.apiService.countData(ApiEntity.SECTION, {['filter[block]']: it.id})
          .then(count => this.list[it.id].section = count);
        this.apiService.countData(ApiEntity.ELEMENT, {['filter[block]']: it.id})
          .then(count => this.list[it.id].element = count);
      }));
  }

  protected readonly Object = Object;

}
