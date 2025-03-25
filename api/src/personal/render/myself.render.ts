import { UserEntity } from '../model/user.entity';

export class MyselfRender {

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