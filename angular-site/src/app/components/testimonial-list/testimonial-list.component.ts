import { Component } from '@angular/core';
import list from './mock/list';
import { Testimonial } from '../../model/Testimonial';

@Component({
  selector: 'app-testimonial-list',
  templateUrl: './testimonial-list.component.html',
  styleUrls: ['./testimonial-list.component.css'],
})
export class TestimonialListComponent {

  itemList: Array<Testimonial> = list;
  current: string = list[0].id;

  handleNext(direction: number) {
    const index = this.itemList.findIndex(item => item.id === this.current) + direction;

    if (!~index) {
      this.current = this.itemList[this.itemList.length - 1].id;
    } else if (index === this.itemList.length) {
      this.current = this.itemList[0].id;
    } else {
      this.current = this.itemList[index].id;
    }
  }

}
