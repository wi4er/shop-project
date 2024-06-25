import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-collection-page',
  templateUrl: './collection-page.component.html',
  styleUrls: ['./collection-page.component.css']
})
export class CollectionPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.collectionId = this.route.snapshot.paramMap.get('id')!;
  }

  collectionId?: string;


  ngOnInit() {
    this.route.paramMap
      .subscribe(value => {
        this.collectionId = value.get('id') ?? '';
      });
  }
}
