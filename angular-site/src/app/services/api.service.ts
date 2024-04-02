import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Element } from '../model/Element';
import qs from 'query-string';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private _url: string = 'http://localhost:3030/element';

  constructor(
    private http: HttpClient,
  ) {

  }

  getElementList(
    block: number,
    filter: Object = {},
  ) {
    const url = qs.stringifyUrl({
      url: this._url,
      query: {'filter[block]': block},
    });

    return this.http.get<Array<Element>>(url);
  }

}
