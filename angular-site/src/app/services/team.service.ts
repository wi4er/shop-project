import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BlogBlock } from '../model/BlogBlock';
import { HttpClient } from '@angular/common/http';
import { ContentBlock } from '../api/ContentBlock';
import { ContentElement } from '../api/ContentElement';
import { Team } from '../model/Team';

@Injectable({
  providedIn: 'root',
})
export class TeamService {

  private apiUrl = 'http://localhost:3030';
  private storageUrl = 'http://localhost:3030/';
  private teamId = 10;

  constructor(
    private http: HttpClient,
  ) {
  }

  /**
   *
   */
  getBlock(): Observable<BlogBlock> {
    return this.http.get<ContentBlock>(`${this.apiUrl}/block/${this.teamId}`)
      .pipe(
        map(item => {
          return {
            id: item.id,
            title: item.property.find(it => it.property === 'NAME')?.string ?? '',
            text: item.property.find(it => it.property === 'TEXT')?.string ?? '',
          };
        }),
      );
  }

  /**
   *
   */
  getElements(): Observable<Array<Team>> {
    return this.http.get<Array<ContentElement>>(`${this.apiUrl}/element?filter[block]=${this.teamId}`)
      .pipe(map(items => {
        return items.map(elem => ({
          id: elem.id,
          name: elem.property.find(it => it.property === 'NAME')?.string ?? '',
          position: elem.property.find(it => it.property === 'TITLE')?.string ?? '',
          image: this.storageUrl + elem.image.find(it => it.collection === 'PREVIEW')?.path ?? '',
        }));
      }));
  }

}
