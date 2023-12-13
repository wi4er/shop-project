import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../model/user.entity';
import { Request } from 'express';

@Injectable()
export class SessionService {

  open(
    req: Request,
    user: UserEntity,
  ) {
    req['session']['user'] = {
      id: user.id,
      group: user.group.map(it => it.id),
    };
  }

  close(
    req: Request,
  ): boolean {
    if (!req['session']['user']) {
      return false;
    }

    req['session']['user'] = null;
    return true;
  }

}
