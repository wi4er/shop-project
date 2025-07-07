import { Component, Input, OnInit } from '@angular/core';
import { AttributeEntity } from '../../app/model/settings/attribute.entity';
import { LangEntity } from '../../app/model/settings/lang.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { AttributeEdit, AttributeStringEdit } from '../attribute-value/attribute-value.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AttributeType } from '../../settings/attribute-form/attribute-form.component';
import { MatDialog } from '@angular/material/dialog';
import { PointEditComponent } from '../point-edit/point-edit.component';

@Component({
  selector: 'app-attribute-edit',
  templateUrl: './attribute-edit.component.html',
  styleUrls: ['./attribute-edit.component.css'],
})
export class AttributeEditComponent implements OnInit {

  loading = true;
  list: AttributeEntity[] = [];
  langList: LangEntity[] = [];

  @Input()
  edit: AttributeEdit = {};

  @Input()
  onHistory?: (attribute: string) => void;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  getRange(attr: AttributeEntity): FormGroup {
    const edit = this.edit[attr.id];

    if ('from' in edit) {
      return new FormGroup({
        start: edit.from as FormControl,
        end: edit.to as FormControl,
      });
    } else {
      return new FormGroup({
        start: new FormControl(null),
        end: new FormControl(null),
      });
    }
  }

  /**
   *
   */
  getString(id: string): AttributeStringEdit {
    return this.edit[id] as AttributeStringEdit;
  }

  /**
   *
   */
  getPoint(id: string): FormControl {
    const value = this.edit[id];

    if ('point' in value) {
      return value.point;
    }

    return new FormControl(null);
  }

  /**
   *
   */
  getCount(id: string): FormControl {
    const value = this.edit[id];

    if ('count' in value) {
      return value.count;
    }

    return new FormControl(null);
  }

  /**
   *
   */
  getCounter(id: string): FormControl {
    const value = this.edit[id];

    if ('count' in value) {
      return value.counter;
    }

    return new FormControl(null);
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<AttributeEntity>(ApiEntity.ATTRIBUTE),
      this.apiService.fetchList<LangEntity>(ApiEntity.LANG),
    ]).then(([attributeList, langList]) => {
      this.list = attributeList;
      this.langList = langList;

      this.initValues();
      this.loading = false;
    });
  }

  /**
   *
   */
  initValues(): void {
    for (const attr of this.list) {

      switch (attr.type) {
        case AttributeType.STRING:
        case AttributeType.DESCRIPTION:
          if (!this.edit[attr.id]) {
            this.edit[attr.id] = {
              type: attr.type,
              edit: {},
            };
          }

          const value = this.edit[attr.id];

          if ('edit' in value) {
            for (const lang of this.langList) {
              if (!value.edit[lang.id]) value.edit[lang.id] = [];
            }

            if (!value.edit['']) value.edit[''] = [];
          }
          break;
        case AttributeType.INTERVAL:
          if (!this.edit[attr.id]) {
            this.edit[attr.id] = {
              type: attr.type,
              from: new FormControl(null),
              to: new FormControl(null),
            };
          }
          break;
        case AttributeType.POINT:
          if (!this.edit[attr.id]) {
            this.edit[attr.id] = {
              type: AttributeType.POINT,
              point: new FormControl(null),
            };
          }
          break;
        case AttributeType.COUNTER:
          if (!this.edit[attr.id]) {
            this.edit[attr.id] = {
              type: AttributeType.COUNTER,
              counter: new FormControl(null),
              count: new FormControl(null),
            };
          }
          break;
      }
    }
  }

  openPoint(attr: string) {
    const value = this.edit[attr];

    if ('point' in value) {
      this.dialog.open(
        PointEditComponent,
        {
          width: '1000px',
          panelClass: 'wrapper',
          data: {
            point: value.point,
          },
        },
      ).afterClosed().subscribe(result => {

      });
    }
  }

  openCounter(attr: string) {
    const value = this.edit[attr];

    if ('counter' in value) {
      this.dialog.open(
        PointEditComponent,
        {
          width: '1000px',
          panelClass: 'wrapper',
          data: {
            point: value.counter,
          },
        },
      ).afterClosed().subscribe(result => {

      });
    }
  }


}
