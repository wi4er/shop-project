import { Injectable } from '@angular/core';


export enum ApiEntity {
  BLOCK = 'block',
  ELEMENT = 'element',
  SECTION = 'section',
  FLAG = 'flag',
  PROPERTY = 'property',
  DIRECTORY = 'directory',
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  fetchData(entity: ApiEntity) {
    const req = fetch(`http://localhost:3001/${entity}`)
      .then(res => {
        if (!res.ok) throw new Error('Api not found!');
        return res.json();
      });

    req.catch(err => console.log(err));

    return req;
  }

}
