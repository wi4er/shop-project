import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FlagFormComponent } from '../../settings/flag-form/flag-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FlagEntity } from '../../settings/model/flag.entity';
import { FlagSettingsComponent } from '../../settings/flag-settings/flag-settings.component';

@Component({
  selector: 'app-dashboard-flag',
  templateUrl: './dashboard-flag.component.html',
  styleUrls: ['./dashboard-flag.component.css'],
})
export class DashboardFlagComponent implements OnInit {

  list: {
    [id: string]: {
      id: string;
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
  handleEdit() {
    this.router.navigate(
      ['flag'],
      {},
    );
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      FlagSettingsComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    ).afterClosed().subscribe(() => this.refreshData());
  }

  /**
   *
   */
  handleMove(id: string) {
    this.dialog.open(
      FlagFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    ).afterClosed().subscribe(() => this.refreshData());
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
    this.list = {};

    this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
        };
      }));
  }

  protected readonly Object = Object;

}
