import { Component, Input } from '@angular/core';
import { Blog } from '../../model/Blog';

@Component({
  selector: 'app-blog-item',
  templateUrl: './blog-item.component.html',
  styleUrls: ['./blog-item.component.css']
})
export class BlogItemComponent {

  @Input()
  item!: Blog;

}
