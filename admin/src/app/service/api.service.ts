import { Injectable } from '@angular/core';


export enum ApiEntity {
  BLOCK = 'block',
  ELEMENT = 'element',
  SECTION = 'section',
  FLAG = 'flag',
  PROPERTY = 'property',
  DIRECTORY = 'directory',
  FORM = 'form',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor() {
  }

  fetchData(entity: ApiEntity, args?: string[]) {
    const url = [
      [
        'http://localhost:3001',
        entity,
      ].join('/'),
      args?.join('&') || undefined,
    ].join('?');

    const req = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Api not found!');
        return res.json();
      });

    req.catch(err => console.log(err));

    return req;
  }

  countData(entity: ApiEntity) {
    const url = [
      'http://localhost:3001',
      entity,
      'count',
    ].join('/');

    const req = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Api not found!');
        return res.json();
      })
      .then(({count}) => count);

    req.catch(err => console.log(err));

    return req;
  }

}
