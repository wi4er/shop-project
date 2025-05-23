import { Injectable } from '@angular/core';
import { ApiEntity, ApiService } from './api.service';
import { UserEntity } from '../model/personal/user.entity';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private userSubject = new BehaviorSubject<UserEntity | null | undefined>(undefined);
  user: Observable<UserEntity | null | undefined> = this.userSubject.asObservable();

  authorize: boolean = false;

  constructor(
    private apiService: ApiService,
  ) {
    fetch('http://localhost:3030/personal/myself', {
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
  ): Promise<UserEntity | null> {
    await fetch('http://localhost:3030/personal/auth', {
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
    await fetch('http://localhost:3030/personal/auth', {
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
