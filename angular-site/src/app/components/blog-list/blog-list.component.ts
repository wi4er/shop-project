import { Component, OnInit } from '@angular/core';
import { Blog } from '../../model/Blog';
import list from "./mock/list";
import { BlogService } from '../../sevices/blog.service';
import { BlogBlock } from '../../model/BlogBlock';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

  blogList: Array<Blog> = list;
  blog?: BlogBlock

  constructor(
    private blogService: BlogService
  ) {
  }

  ngOnInit() {
    this.blogService.getBlock()
      .subscribe(item => this.blog = item);
    this.blogService.getElements()
      .subscribe(list => {

      })
  }

}
