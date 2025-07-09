import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FormControl } from '@angular/forms';
import { FlagEntity } from '../../settings/model/flag.entity';

@Component({
  selector: 'app-element-settings',
  templateUrl: './element-settings.component.html',
  styleUrls: ['./element-settings.component.css'],
})
export class ElementSettingsComponent implements OnInit {

  attributeList: AttributeEntity[] = [];
  flagList: FlagEntity[] = [];

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
      this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE),
      this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG),
    ]).then(([property, flag]) => {
      this.attributeList = property;
      this.flagList = flag;
    });
  }

  /**
   *
   */
  saveData() {

  }

}
