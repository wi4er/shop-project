import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DirectoryEntity } from '../../app/model/registry/directory.entity';

@Component({
  selector: 'app-dashboard-registry',
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
    this.apiService.fetchList<DirectoryEntity>(ApiEntity.DIRECTORY)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
          count: 0,
        };
      }));
  }

}
