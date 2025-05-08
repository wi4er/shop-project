import { Component } from '@angular/core';
import { Attribute } from '../../app/model/settings/attribute';
import { Flag } from '../../app/model/settings/flag';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-registry-settings',
  templateUrl: './directory-settings.component.html',
  styleUrls: ['./directory-settings.component.css']
})
export class DirectorySettingsComponent {

  attributeList: Attribute[] = [];
  flagList: Flag[] = [];

  pages: { [key: number]: string } = {
    0: 'attributes',
    1: 'orders',
  };

  selected = new FormControl(0);

}
