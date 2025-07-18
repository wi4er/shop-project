import { Injectable } from '@angular/core';
import qs from 'query-string';
import { StringifiableRecord } from 'query-string/base';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum ApiEntity {
  BLOCK = 'content/block',
  ELEMENT = 'content/element',
  SECTION = 'content/section',
  FLAG = 'settings/flag',
  ATTRIBUTE = 'settings/attribute',
  LANG = 'settings/lang',
  FIELD = 'settings/field',
  DIRECTORY = 'registry/directory',
  POINT = 'registry/point',
  DIRECTORY_LOG = 'registry/log/directory',
  FORM = 'feedback/form',
  FORM_LOG = 'feedback/form-log',
  RESULT = 'feedback/result',
  DOCUMENT = 'bundle/document',
  COLLECTION = 'collection',
  FILE = 'file',
  USER = 'personal/user',
  CONTACT = 'personal/contact',
  GROUP = 'personal/group',
  ACCESS = 'personal/access',
  MYSELF = 'personal/myself',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  apiUrl = 'http://localhost:3030';

  constructor(
    private errorBar: MatSnackBar,
  ) {
  }

  /**
   *
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
      if (res.ok) {
        return reason;
      } else {
        this.errorBar.open(reason.message, 'close', {duration: 5000});
        return Promise.reject(reason.message);
      }
    }));
  }

  /**
   *
   */
  putData<T>(
    entity: ApiEntity,
    id: string | number, item: T): Promise<string> {
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
      if (res.ok) {
        return reason;
      } else {
        this.errorBar.open(reason.message, 'close', {duration: 5000});
        return Promise.reject(reason.message);
      }
    }));

    return req;
  }

  /**
   *
   */
  patchData<T>(
    entity: ApiEntity,
    id: string | number, item: T): Promise<string> {
    const url = [
      this.apiUrl,
      entity,
      id.toString(),
    ].join('/');

    const req = fetch(url, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(item),
    }).then(res => res.json().then(reason => {
      if (res.ok) {
        return reason;
      } else {
        this.errorBar.open(reason.message, 'close', {duration: 5000});
        return Promise.reject(reason.message);
      }
    }));

    return req;
  }

  /**
   *
   */
  deleteList(
    entity: ApiEntity,
    idList: string[] | number[],
  ) {
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
      }).then(res => res.json().then(reason => {
        if (res.ok) {
          return reason;
        } else {
          this.errorBar.open(reason.message, 'close', {duration: 5000});
          return Promise.reject(reason.message);
        }
      })));
    }

    return Promise.all(reqList);
  }

}
