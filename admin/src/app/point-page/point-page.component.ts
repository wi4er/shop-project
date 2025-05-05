import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-point-page',
  templateUrl: './point-page.component.html',
  styleUrls: ['./point-page.component.css']
})
export class PointPageComponent implements OnInit {

  directoryId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.directoryId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.route.paramMap
      .subscribe(value => {
        this.directoryId = value.get('id') ?? '';
      });

    this.route.queryParams
      .subscribe(value => {

      });
  }

}
