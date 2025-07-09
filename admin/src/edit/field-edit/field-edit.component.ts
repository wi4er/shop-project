import { Component, Input } from '@angular/core';
import { FlagEdit } from '../flag-value/flag-value.service';
import { FlagEntity } from '../../settings/model/flag.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FieldEntity } from '../../settings/model/field.entity';

@Component({
  selector: 'app-field-edit',
  templateUrl: './field-edit.component.html',
  styleUrls: ['./field-edit.component.css'],
})
export class FieldEditComponent {

  loading = true;
  list: Array<FieldEntity> = [];

  @Input()
  edit!: FlagEdit;

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    this.apiService.fetchList<FieldEntity>(ApiEntity.FIELD)
      .then(flag => {
        this.list = flag;
        this.loading = false;
      });
  }

}
