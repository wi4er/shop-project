import { Component, Input } from '@angular/core';
import { MainFeature } from '../../model/MainFeature';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-main-features',
  templateUrl: './main-features.component.html',
  styleUrls: ['./main-features.component.css']
})
export class MainFeaturesComponent {

  constructor(
    public sanitizer: DomSanitizer,
  ) {
  }

  @Input()
  list: Array<MainFeature> = [];

}
