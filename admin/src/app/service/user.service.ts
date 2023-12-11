import { Injectable } from '@angular/core';
import { ApiEntity, ApiService } from './api.service';
import { User } from '../model/user/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private dataSubject = new BehaviorSubject<User | null>(null);

  user: Observable<User | null> = this.dataSubject.asObservable();

  constructor(
    private apiService: ApiService,
  ) {
    this.apiService.fetchItem<User>(ApiEntity.MYSELF)
      .then(user => this.dataSubject.next(user));
  }

  async authUser(
    login: string,
    password: string,
  ): Promise<User | null> {
    await fetch('http://localhost:3001/auth', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({login, password}),
      credentials: 'include',
    }).then(res => {
      if (res.ok) return res.json();
      return console.error(res);
    }).then(res => {
      this.dataSubject.next(res);
    });

    return null;
  }


}
