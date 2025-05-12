import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AccessTarget } from '../model/access/access-target';
import { AccessMethod } from '../model/access/access-method';
import { AccessEntity } from '../model/access/access.entity';
import { PermissionException } from '../../exception/permission/permission.exception';

export const CHECK_ACCESS = 'CHECK_ACCESS';

export function CheckAccess(
  target: AccessTarget,
  method: AccessMethod,
) {
  return SetMetadata(CHECK_ACCESS, {target, method});
}

@Injectable()
export class CheckAccessGuard
  implements CanActivate {

  constructor(
    private reflector: Reflector,
    @InjectEntityManager()
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const check = this.reflector.get<{
      target: AccessTarget,
      method: AccessMethod,
    }>(
      CHECK_ACCESS,
      context.getHandler(),
    );

    if (!check) return true;

    const req = context.switchToHttp().getRequest();
    const group = req?.session?.user?.group ?? [];

    PermissionException.assert(
      await this.manager
        .getRepository(AccessEntity)
        .findOne({
          where: {
            target: check.target,
            method: In([check.method, AccessMethod.ALL]),
            group: Or(In(group), IsNull()),
          },
        }),
      `Permission denied`,
    );

    return true;
  }

}
