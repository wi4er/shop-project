import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PropertyFormComponent } from '../../settings/property-form/property-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Property } from '../../app/model/settings/property';

@Component({
  selector: 'app-dashboard-attribute',
  templateUrl: './dashboard-property.component.html',
  styleUrls: ['./dashboard-property.component.css'],
})
export class DashboardPropertyComponent implements OnInit {

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
      ['/property'],
      {},
    );
  }

  handleSettings() {
    console.log('EDIT');
  }

  handleMove(id: string) {
    const dialog = this.dialog.open(
      PropertyFormComponent,
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

    this.apiService.fetchList<Property>(ApiEntity.PROPERTY)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
        };
      }));
  }

  protected readonly Object = Object;

}
