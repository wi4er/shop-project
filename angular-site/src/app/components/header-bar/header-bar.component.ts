import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface MenuItem {

  id: number;
  name: string;
  link: string;

}

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit {

  list: Array<MenuItem> = [{
    id: 1,
    name: 'Home',
    link: '/'
  }, {
    id: 2,
    name: 'About Us',
    link: '/about'
  }, {
    id: 3,
    name: 'Blog',
    link: '/blog'
  }];

  constructor(
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.url.subscribe(url => {
      console.log(url);
    })
  }

}
