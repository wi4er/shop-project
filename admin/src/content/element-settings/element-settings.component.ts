import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attribute } from '../../app/model/settings/attribute';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FormControl } from '@angular/forms';
import { Flag } from '../../app/model/settings/flag';

@Component({
  selector: 'app-element-settings',
  templateUrl: './element-settings.component.html',
  styleUrls: ['./element-settings.component.css'],
})
export class ElementSettingsComponent implements OnInit {

  attributeList: Attribute[] = [];
  flagList: Flag[] = [];

  pages: { [key: number]: string } = {
    0: 'attributes',
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
      this.apiService.fetchList<Attribute>(ApiEntity.ATTRIBUTE),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
    ]).then(([property, flag]) => {
      this.attributeList = property;
      this.flagList = flag;
    });
  }

  handleChange(index: number) {
  }

  saveData() {

  }

}
