import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ContentBlock } from '../model/ContentBlock';
import { ContentElement } from '../model/ContentElement';
import { BlogBlock } from '../model/BlogBlock';
import { Blog } from '../model/Blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private apiUrl = 'http://localhost:3030';
  private blogId = 1;

  constructor(
    private http: HttpClient
  ) {

  }

  /**
   *
   */
  getBlock(): Observable<BlogBlock> {
    return this.http.get<ContentBlock>(`${this.apiUrl}/block/${this.blogId}`)
      .pipe(
        map(item => {
          return {
            id: item.id,
            title: item.property.find(it => it.property === 'TITLE')?.string ?? '',
            text: item.property.find(it => it.property === 'TEXT')?.string ?? '',
          }
        })
      );
  }

  /**
   *
   */
  getElements(): Observable<Array<Blog>> {
    return this.http.get<Array<ContentElement>>(this.apiUrl + '/element')
      .pipe(map(items => {

        console.log(items);
        return items.map(elem => ({
          id: elem.id,
          title: elem.property.find(it => it.property === 'NAME')?.string ?? '',
          text: elem.property.find(it => it.property === 'TEXT')?.string ?? '',
          link: elem.property.find(it => it.property === 'LINK')?.string ?? '',
          image: ''
        }))
      }))
  }

}
