import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AttributeFormComponent } from '../../settings/attribute-form/attribute-form.component';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { AttributeSettingsComponent } from '../../settings/attribute-settings/attribute-settings.component';

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

  /**
   *
   */
  handleEdit() {
    this.router.navigate(
      ['/property'],
      {},
    );
  }

  /**
   *
   */
  openSettings() {
    this.dialog.open(
      AttributeSettingsComponent,
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
      AttributeFormComponent,
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

    this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE)
      .then(list => list.forEach(it => {
        this.list[it.id] = {
          id: it.id,
        };
      }));
  }

  protected readonly Object = Object;

}
