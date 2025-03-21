import { Component } from '@angular/core';
import { Blog } from '../../model/Blog';
import list from "./mock/list";

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent {

  blogList: Array<Blog> = list;

}
