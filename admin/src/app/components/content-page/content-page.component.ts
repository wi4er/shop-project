import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ObservableInput, switchMap } from 'rxjs';

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css'],
})
export class ContentPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.blockId = +this.route.snapshot.paramMap.get('id')!;
  }

  pages: { [key: number]: string } = {
    0: 'element',
    1: 'section',
  };

  selected = new FormControl(0);

  blockId: number;

  ngOnInit(): void {
    this.route.paramMap
      .subscribe(value => {
        this.blockId = +(value.get('id') ?? 0);
      });

    this.route.queryParams
      .subscribe(value => {
        for (const key in this.pages) {
          if (this.pages[key] === value['page']) {
            this.selected.setValue(+key);
          }
        }
      });
  }

  handleChange(index: number) {
    this.router.navigate(
      ['/content', this.blockId],
      {queryParams: {page: this.pages[index]}},
    );
  }

}
