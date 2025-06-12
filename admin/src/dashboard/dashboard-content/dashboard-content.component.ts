import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { BlockEntity } from '../../app/model/content/block.entity';
import { MatDialog } from '@angular/material/dialog';
import { BlockSettingsComponent } from '../../content/block-settings/block-settings.component';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css'],
})
export class DashboardContentComponent implements OnInit {

  list: {
    [id: string]: {
      id: string;
      section: number;
      element: number;
    }
  } = {};

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
  ) {
  }

  handleEdit() {
    this.router.navigate(
      ['/content'],
      {},
    );
  }

  /**
   *
   * @param id
   */
  handleMove(id: string) {
    this.router.navigate(
      ['/content', id],
      {},
    );
  }

  /**
   *
   */
  ngOnInit() {
    this.refreshData();
  }

  /**
   *
   */
  refreshData() {
    this.apiService.fetchList<BlockEntity>(ApiEntity.BLOCK)
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

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      BlockSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      }
    ).afterClosed().subscribe(() => this.refreshData())
  }

  protected readonly Object = Object;

}
