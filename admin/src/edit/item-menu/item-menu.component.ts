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
  onDelete?: () => void;

  @Input()
  onEdit?: () => void;

  @Input()
  onHistory?: () => void;

  @Input()
  onFlag?: (id: string) => void;

  @Input()
  flagList: Array<Flag> = [];

  @Input()
  active: string[] = [];

  /**
   *
   */
  getFlagName(flag: Flag): string {
    const name = flag.attribute.find(it => it.attribute === 'NAME');

    if (name) {
      return name.string;
    } else {
      return flag.id;
    }
  }

}
