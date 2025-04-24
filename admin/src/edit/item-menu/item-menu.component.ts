import { Component, Input, OnInit } from '@angular/core';
import { Flag } from '../../app/model/settings/flag';

@Component({
  selector: 'app-item-menu',
  templateUrl: './item-menu.component.html',
  styleUrls: ['./item-menu.component.css'],
})
export class ItemMenuComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  @Input()
  onDelete() {
    console.log('DELETE EXPECTED');
  }

  @Input()
  onEdit() {
    console.log('DELETE EXPECTED');
  }

  @Input()
  flagList: Array<Flag> = [];

  @Input()
  active: string[] = [];

  @Input()
  onFlag(id: string) {
    console.log(id);
  }

  getFlagName(flag: Flag): string {
    const name = flag.property.find(it => it.property === 'NAME');

    if (name) {
      return name.string;
    } else {
      return flag.id;
    }
  }

}
