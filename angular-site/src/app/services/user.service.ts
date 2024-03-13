import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor() {
  }


  user?: object;

  postAuth(
    login: string,
    password: string,
  ) {
    return fetch('http://localhost:3030/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({login, password}),
    }).then(res => {
      if (res.ok) return res.json();

      throw new Error();
    }).then(res => {
      console.log(res);
    });
  }

  getMyself() {
    return fetch('http://localhost:3030/myself', {
      credentials: 'include',
    }).then(res => {
      if (res.ok) return res.json();

      throw new Error();
    }).then(res => {
      console.log(res);
    });
  }

}
