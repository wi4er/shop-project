import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-section-page',
  templateUrl: './section-page.component.html',
  styleUrls: ['./section-page.component.css']
})
export class SectionPageComponent {

  sectionId?: number;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe(list => {
      this.sectionId = Number(list.get('id'));
    });
  }


}
