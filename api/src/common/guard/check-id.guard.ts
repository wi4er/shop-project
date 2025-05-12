import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseEntity, EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';

export const CHECK_ID = 'CHECK_ID';

export const CheckId = (entity: new() => BaseEntity) => {
  return SetMetadata(CHECK_ID, entity);
};

@Injectable()
export class CheckIdGuard
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
    const entity = this.reflector.get<new() => {id: any}>(
      CHECK_ID,
      context.getHandler(),
    );

    if (!entity) return true;

    const id = context.switchToHttp().getRequest().params['id'];

    NoDataException.assert(
      await this.manager
        .getRepository(entity)
        .findOne({where: {id}}),
      `Entity with ID ${id} not found!`,
    );

    return true;
  }

}
