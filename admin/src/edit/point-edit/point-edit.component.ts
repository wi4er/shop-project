import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DirectoryEntity } from '../../app/model/registry/directory.entity';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css'],
})
export class PointEditComponent implements OnInit {

  loading = true;

  list: Array<DirectoryEntity> = [];
  form: FormGroup;
  pointControl = new FormControl();

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA)
    public data: { point: FormControl, directory: string },
  ) {
    this.form = new FormGroup({
      point: this.pointControl,
    });

    this.pointControl.valueChanges.subscribe(value => {
      this.data.point.setValue(value[0]);
    });
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<DirectoryEntity>(
        ApiEntity.POINT,
        {
          directory: this.data.directory,
        },
      ),
    ]).then(([pointList]) => {
      this.list = pointList;
      this.loading = false;
    });
  }

}
