import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-personal-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.blockId = +this.route.snapshot.paramMap.get('id')!;
  }

  pages: { [key: number]: string } = {
    0: 'user',
    1: 'contact',
    2: 'group',
  };

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
      ['/user'],
      {queryParams: {page: this.pages[index]}},
    );
  }

}
