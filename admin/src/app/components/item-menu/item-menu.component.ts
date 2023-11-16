import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-menu',
  templateUrl: './item-menu.component.html',
  styleUrls: [ './item-menu.component.css' ],
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
  flags: string[] = [];

  @Input()
  active: string[] = [];

  @Input()
  onFlag(id: string) {
    console.log(id);
  }

}
