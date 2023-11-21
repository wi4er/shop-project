import { Injectable } from '@angular/core';

export enum ApiEntity {
  BLOCK = 'block',
  ELEMENT = 'element',
  SECTION = 'section',
  FLAG = 'flag',
  PROPERTY = 'property',
  DIRECTORY = 'directory',
  FORM = 'form',
  LANG = 'lang',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor() {
  }

  fetchData<T>(entity: ApiEntity, args?: string[]) : Promise<T[]> {
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

  fetchItem<T>(entity: ApiEntity, id: string) : Promise<T> {
    const url = [
      [
        'http://localhost:3001',
        entity,
        id,
      ].join('/'),
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

  postData<T>(entity: ApiEntity, item: T) : Promise<Response> {
    const url = [
      'http://localhost:3001',
      entity,
    ].join('/');

    const req = fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(item)
    }).then()

    return req;
  }

}
