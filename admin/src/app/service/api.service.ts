import { Injectable } from '@angular/core';
import qs from 'query-string';
import { StringifiableRecord } from 'query-string/base';

export enum ApiEntity {
  BLOCK = 'block',
  ELEMENT = 'element',
  SECTION = 'section',
  FLAG = 'flag',
  PROPERTY = 'property',
  DIRECTORY = 'directory',
  FORM = 'form',
  RESULT = 'result',
  LANG = 'lang',
  USER = 'user',
  CONTACT = 'contact',
  GROUP = 'group',
  DOCUMENT = 'document',
  COLLECTION = 'collection',
  FILE = 'file',
  MYSELF = 'myself',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  apiUrl = 'http://localhost:3030';

  constructor() {
  }

  /**
   *
   * @param entity
   * @param query
   */
  fetchList<T>(entity: ApiEntity, query?: StringifiableRecord): Promise<T[]> {
    const url = qs.stringifyUrl({
      url: [this.apiUrl, entity].join('/'),
      query: query,
    }, {sort: false});

    const req = fetch(url, {
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
    }).then(res => {
      if (!res.ok) throw new Error('Api not found!');
      return res.json();
    });

    req.catch(err => console.log(err));

    return req;
  }

  /**
   *
   * @param entity
   * @param id
   */
  fetchItem<T>(entity: ApiEntity, id?: string): Promise<T> {
    const req = fetch(
      [this.apiUrl, entity, id].join('/'), {
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
      },
    ).then(res => {
      if (!res.ok) throw new Error('Api not found!');
      return res.json();
    });

    req.catch(err => console.error(err));

    return req;
  }

  /**
   *
   * @param entity
   * @param query
   */
  countData(entity: ApiEntity, query?: StringifiableRecord) {
    const url = qs.stringifyUrl({
      url: [this.apiUrl, entity, 'count'].join('/'),
      query: query,
    });

    const req = fetch(
      url,
      {
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
      },
    )
      .then(res => {
        if (!res.ok) throw new Error('Api not found!');
        return res.json();
      })
      .then(({count}) => count);

    req.catch(err => console.log(err));

    return req;
  }

  /**
   *
   * @param entity
   * @param item
   */
  postData<T>(entity: ApiEntity, item: T): Promise<string> {
    const url = [
      this.apiUrl,
      entity,
    ].join('/');

    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(item),
    }).then(res => res.json().then(reason => {
      return res.ok ?reason : Promise.reject(reason.message);
    }));
  }

  putData<T>(entity: ApiEntity, id: string | number, item: T): Promise<Response> {
    const url = [
      this.apiUrl,
      entity,
      id.toString(),
    ].join('/');

    const req = fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(item),
    }).then(res => res.json().then(reason => {
      return res.ok ?reason : Promise.reject(reason.message);
    }));

    return req;
  }

  deleteList(entity: ApiEntity, idList: string[] | number[]) {
    const reqList = [];

    for (const id of idList) {
      const url = [
        this.apiUrl,
        entity,
        id.toString(),
      ].join('/');

      reqList.push(fetch(url, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
      }).then(res => {
        if (!res.ok) console.error(res);
        return res.json();
      }));
    }

    return Promise.all(reqList);
  }

}
