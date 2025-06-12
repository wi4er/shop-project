import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-collection-settings',
  templateUrl: './collection-settings.component.html',
  styleUrls: ['./collection-settings.component.css']
})
export class CollectionSettingsComponent {

  pages: { [key: number]: string } = {
    0: 'attributes',
    1: 'flags',
    2: 'orders',
  };
  selected = new FormControl(0);


  /**
   *
   */
  saveData() {

  }

}
