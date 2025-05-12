import { AccessMethod } from '../model/access/access-method';
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import {  EntityManager, In, IsNull, Or } from 'typeorm';
import { CHECK_ACCESS } from './check-access.guard';
import { CommonPermissionEntity } from '../../common/model/common-permission.entity';
import { PermissionOperation } from '../../permission/model/permission-operation';
import { PermissionException } from '../../exception/permission/permission.exception';

export const CHECK_PERMISSION = 'CHECK_PERMISSION';

export function CheckPermission(
  entity: new() => CommonPermissionEntity<any>,
  method: PermissionOperation
) {
  return SetMetadata(CHECK_PERMISSION, {entity, method});
}

@Injectable()
export class CheckPermissionGuard
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
      entity: new() => CommonPermissionEntity<any>,
      method: PermissionOperation,
    }>(
      CHECK_PERMISSION,
      context.getHandler(),
    );

    if (!check) return true;

    const req = context.switchToHttp().getRequest();
    const group = req?.session?.user?.group ?? [];
    const id = req.params['id'];

    PermissionException.assert(
      await this.manager
        .getRepository(check.entity)
        .findOne({
          where: {
            parent: {id},
            method: In([check.method, AccessMethod.ALL]),
            group: Or(In(group), IsNull()),
          },
        }),
      `Permission denied`,
    );

    return true;
  }
}