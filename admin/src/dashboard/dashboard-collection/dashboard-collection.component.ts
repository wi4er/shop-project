import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { CollectionEntity } from '../../app/model/storage/collection.entity';
import { MatDialog } from '@angular/material/dialog';
import { CollectionSettingsComponent } from '../../storage/collection-settings/collection-settings.component';

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
    private dialog: MatDialog,
  ) {
  }

  /**
   *
   */
  handleMove(id: string) {
    this.router.navigate(
      ['collection', id],
      {},
    );
  }

  /**
   *
   */
  handleEdit() {
    this.router.navigate(
      ['storage'],
      {},
    );
  }

  /**
   *
   */
  ngOnInit() {
    this.refreshData()
  }

  /**
   *
   */
  refreshData() {
    this.apiService.fetchList<CollectionEntity>(ApiEntity.COLLECTION)
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

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      CollectionSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  protected readonly Object = Object;

}
