import { UserEntity } from '../model/user/user.entity';

export class MyselfView {

  constructor(item: UserEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.login = item.login;
    this.group = item.group.map(it => it.group.id);
  }

  id: string;
  created_at: string;
  login: string;
  group: string[];

}