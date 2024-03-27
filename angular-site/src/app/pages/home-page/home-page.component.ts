import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Element } from '../../model/Element';
import { MainFeature } from '../../model/MainFeature';

@Component({
  selector: 'app-main-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {

  featureList: Array<Element> = [];

  constructor(
    private apiService: ApiService,
  ) {
  }

  ngOnInit() {
    this.apiService.getElementList(1)
      .subscribe(data => this.featureList = data);
  }

  toFeature(item: Element) {
    return new MainFeature(item);
  }

}
