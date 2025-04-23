import { Component, Input, OnInit } from '@angular/core';
import { Flag } from '../../app/model/settings/flag';
import { ApiEntity, ApiService } from '../../app/service/api.service';

@Component({
  selector: 'app-flag-edit',
  templateUrl: './flag-edit.component.html',
  styleUrls: [ './flag-edit.component.css' ]
})
export class FlagEditComponent implements OnInit {

  loading = true;

  @Input()
  list: Flag[] = []

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
    this.apiService.fetchList<Flag>(ApiEntity.FLAG)
      .then(flag => {
        this.list = flag;
        this.loading = false;
      });
  }

}
