import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-flag-settings',
  templateUrl: './flag-settings.component.html',
  styleUrls: ['./flag-settings.component.css']
})
export class FlagSettingsComponent {


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
