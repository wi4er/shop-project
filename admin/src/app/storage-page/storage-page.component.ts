import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-storage-page',
  templateUrl: './storage-page.component.html',
  styleUrls: ['./storage-page.component.css']
})
export class StoragePageComponent {

  pages: { [key: number]: string } = {
    0: 'element',
    1: 'section',
  };

  selected = new FormControl(0);

}
