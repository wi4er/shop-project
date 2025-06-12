import { Component, Input, OnInit } from '@angular/core';
import { FlagEntity } from '../../app/model/settings/flag.entity';
import { ApiEntity, ApiService } from '../../app/service/api.service';

@Component({
  selector: 'app-flag-edit',
  templateUrl: './flag-edit.component.html',
  styleUrls: [ './flag-edit.component.css' ]
})
export class FlagEditComponent implements OnInit {

  loading = true;

  @Input()
  list: FlagEntity[] = []

  @Input()
  edit: { [flag: string]: boolean } = {};

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    this.apiService.fetchList<FlagEntity>(ApiEntity.FLAG)
      .then(flag => {
        this.list = flag;
        this.loading = false;
      });
  }

}
