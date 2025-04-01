import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Property } from '../../app/model/settings/property';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FormControl } from '@angular/forms';
import { Flag } from '../../app/model/settings/flag';

@Component({
  selector: 'app-element-settings',
  templateUrl: './element-settings.component.html',
  styleUrls: ['./element-settings.component.css'],
})
export class ElementSettingsComponent implements OnInit {

  propertyList: Property[] = [];
  flagList: Flag[] = [];

  pages: { [key: number]: string } = {
    0: 'properties',
    1: 'orders',
  };

  selected = new FormControl(0);

  constructor(
    private dialogRef: MatDialogRef<ElementSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { block: number } | null,
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
    ]).then(([property, flag]) => {
      this.propertyList = property;
      this.flagList = flag;
    });
  }

  handleChange(index: number) {
  }

  saveData() {

  }

}
