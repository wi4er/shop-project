import { Component, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../service/api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Flag } from '../model/settings/flag';
import { FlagFormComponent } from '../../settings/flag-form/flag-form.component';

@Component({
  selector: 'app-dashboard-flag',
  templateUrl: './dashboard-flag.component.html',
  styleUrls: ['./dashboard-flag.component.css']
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

  handleEdit() {
    this.router.navigate(
      ['/flag'],
      {},
    );
  }

  handleSettings() {
    console.log('EDIT');
  }

  handleMove(id: string) {
    const dialog = this.dialog.open(
      FlagFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed().subscribe(() => this.refreshData());
  }

  ngOnInit() {
    this.refreshData()
  }

  refreshData() {
    this.list = {};

    this.apiService.fetchList<Flag>(ApiEntity.FLAG)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
        };
      }));
  }

  protected readonly Object = Object;

}
