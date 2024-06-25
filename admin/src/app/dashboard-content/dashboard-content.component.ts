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

  list: Array<{
    id: number;
    count: number;
  }> =  [];

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
  }

  handleEdit() {
    console.log("EDIT");
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
        this.list.push({
          id: it.id,
          count: 0,
        })

      }));
  }

}
