import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-attribute-settings',
  templateUrl: './attribute-settings.component.html',
  styleUrls: ['./attribute-settings.component.css']
})
export class AttributeSettingsComponent {

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
