import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.blockId = +this.route.snapshot.paramMap.get('id')!;
  }

  pages: { [key: number]: string } = {
    0: 'element',
    1: 'section',
  }

  selected = new FormControl(0);

  blockId: number;

  ngOnInit(): void {
    this.route.queryParams.subscribe(value => {
      for (const key in this.pages) {
        if (this.pages[key] === value['page']) {
          this.selected.setValue(+key);
        }
      }
    });
  }

  handleChange(index: number) {
    this.router.navigate(
      [ '/content', this.blockId ],
      { queryParams: { page: this.pages[index] } }
    );
  }

}
