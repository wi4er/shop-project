import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-block-settings',
  templateUrl: './block-settings.component.html',
  styleUrls: ['./block-settings.component.css']
})
export class BlockSettingsComponent {

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
