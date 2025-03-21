import { Component, Input } from '@angular/core';
import { Testimonial } from '../../model/Testimonial';

@Component({
  selector: 'app-testimonial-item',
  templateUrl: './testimonial-item.component.html',
  styleUrls: ['./testimonial-item.component.css']
})
export class TestimonialItemComponent {

  @Input({required: true})
  item!: Testimonial;

  @Input()
  current: boolean = false;

}
