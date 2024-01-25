import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent {

  productId?: number;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe(params => {
      this.productId = Number(params.get('id'));
    });
  }
}
