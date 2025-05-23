import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PermissionEdit } from '../../edit/permission-value/permission-value.service';

@Component({
  selector: 'app-registry-settings',
  templateUrl: './directory-settings.component.html',
  styleUrls: ['./directory-settings.component.css']
})
export class DirectorySettingsComponent {

  permissionEdit: PermissionEdit = {};

  pages: { [key: number]: string } = {
    0: 'permissions',
    1: 'attributes',
    2: 'flags',
    3: 'sorts',
  };

  selected = new FormControl(0);

  /**
   *
   */
  saveItem() {
    console.log('SAVE');
  }

}
