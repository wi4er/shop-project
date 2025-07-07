import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-element-history',
  templateUrl: './element-history.component.html',
  styleUrls: ['./element-history.component.css']
})
export class ElementHistoryComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {id: string, attribute: string},
  ) {
  }

}
