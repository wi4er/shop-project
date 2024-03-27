import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Element } from '../model/Element';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _url: string = "http://localhost:3030/element"

  constructor(
    private http: HttpClient
  ) {

  }

  getElementList(
    block: number,
    filter: Object = {},
  ) {
    return this.http.get<Array<Element>>(this._url);
  }

}
