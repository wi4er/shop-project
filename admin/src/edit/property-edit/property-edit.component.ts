import { Component, Input } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';

@Component({
  selector: 'app-property-edit',
  templateUrl: './property-edit.component.html',
  styleUrls: [ './property-edit.component.css' ],
})
export class PropertyEditComponent {

  constructor() {
  }

  @Input()
  list: Property[] = [];

  @Input()
  lang: Lang[] = [];

  @Input()
  edit: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};

  addEdit(id: string, lang: string) {
    if (!this.edit[id][lang]) this.edit[id][lang] = [];

    this.edit[id][lang].push({
      value: '',
      error: '',
    });
  }

  clearEdit(id: string, lang: string, index: number) {
    this.edit[id][lang].splice(index, 1);
  }

}
