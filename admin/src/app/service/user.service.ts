import { Injectable } from '@angular/core';
import { ApiEntity, ApiService } from './api.service';
import { User } from '../model/user/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private userSubject = new BehaviorSubject<User | null | undefined>(undefined);
  user: Observable<User | null | undefined> = this.userSubject.asObservable();

  authorize: boolean = false;

  constructor(
    private apiService: ApiService,
  ) {
    fetch('http://localhost:3030/myself', {
      credentials: 'include',
    }).then(res => {
      if (res.ok) {
        res.json().then(res => this.userSubject.next(res));
        this.authorize = true;
      } else {
        this.userSubject.next(null);
      }
    });
  }

  /**
   *
   */
  async authUser(
    login: string,
    password: string,
  ): Promise<User | null> {
    await fetch('http://localhost:3030/auth', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({login, password}),
      credentials: 'include',
    }).then(res => {
      if (res.ok) {
        res.json().then(res => this.userSubject.next(res));
        this.authorize = true;
      }
    });

    return null;
  }

  /**
   *
   */
  async logOutUser() {
    await fetch('http://localhost:3030/auth', {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
    }).then(res => {
      if (res.ok) {
        this.userSubject.next(null);
        this.authorize = false;
      }
    });
  }

}
