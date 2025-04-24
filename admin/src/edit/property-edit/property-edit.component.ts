import { Component, Input, OnInit } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { ApiEntity, ApiService } from '../../app/service/api.service';

@Component({
  selector: 'app-attribute-edit',
  templateUrl: './property-edit.component.html',
  styleUrls: [ './property-edit.component.css' ],
})
export class PropertyEditComponent implements OnInit {

  list: Property[] = [];
  lang: Lang[] = [];

  @Input()
  edit: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};

  constructor(
    private apiService: ApiService,
  ) {}

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
    ]).then(([property, lang]) => {
      this.list = property;
      this.lang = lang;

      this.initValues();
    });
  }

  /**
   *
   */
  initValues(): void {
    for (const prop of this.list) {
      if (!this.edit[prop.id]) this.edit[prop.id] = {};

      for (const lang of this.lang) {
        if (!this.edit[prop.id][lang.id]) this.edit[prop.id][lang.id] = [];
      }

      if (!this.edit[prop.id]['']) this.edit[prop.id][''] = [];
    }
  }

  /**
   *
   */
  addEdit(id: string, lang: string) {
    if (!this.edit[id][lang]) this.edit[id][lang] = [];

    this.edit[id][lang].push({
      value: '',
      error: '',
    });
  }

  /**
   *
   */
  clearEdit(id: string, lang: string, index: number) {
    this.edit[id][lang].splice(index, 1);
  }

}
