import { Component, Input, OnInit } from '@angular/core';
import { Flag } from '../../model/settings/flag';

@Component({
  selector: 'app-flag-edit',
  templateUrl: './flag-edit.component.html',
  styleUrls: [ './flag-edit.component.css' ]
})
export class FlagEditComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  @Input()
  list: Flag[] = []

  @Input()
  edit: { [flag: string]: boolean } = {};

}
