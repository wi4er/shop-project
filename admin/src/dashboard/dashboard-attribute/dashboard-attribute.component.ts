import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AttributeFormComponent } from '../../settings/attribute-form/attribute-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Attribute } from '../../app/model/settings/attribute';

@Component({
  selector: 'app-dashboard-attribute',
  templateUrl: './dashboard-attribute.component.html',
  styleUrls: ['./dashboard-attribute.component.css'],
})
export class DashboardAttributeComponent implements OnInit {

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
      AttributeFormComponent,
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

    this.apiService.fetchList<Attribute>(ApiEntity.ATTRIBUTE)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
        };
      }));
  }

  protected readonly Object = Object;

}
