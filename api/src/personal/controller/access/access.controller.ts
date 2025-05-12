import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { AccessEntity } from '../../model/access/access.entity';
import { CurrentGroups } from '../../decorator/current-groups/current-groups.decorator';
import { PermissionOperation } from '../../../permission/model/permission-operation';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { AccessRender } from '../../render/access.render';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { AccessInput } from '../../input/access.input';
import { RegistryPermissionInsertOperation } from '../../../registry/operation/permission/registry-permission-insert.operation';
import { RegistryPermissionUpdateOperation } from '../../../registry/operation/permission/registry-permission-update.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { RegistryPermissionDeleteOperation } from '../../../registry/operation/permission/registry-permission-delete.operation';
import { CheckId } from '../../../common/guard/check-id.guard';

@Controller('personal/access')
export class AccessController {

  relations = {
    permission: {group: true},
  } as FindOptionsRelations<AccessEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(AccessEntity)
    private permRepo: Repository<AccessEntity>,
  ) {
  }

  toView(item: AccessEntity): AccessRender {
    return new AccessRender(item);
  }

  /**
   *
   */
  toWhere(): FindOptionsWhere<AccessEntity> {
    const where = {};


    return where;
  }

  @Get()
  async getList(
    @CurrentGroups()
      group: string[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.permRepo.find({
      where: {
        ...this.toWhere(),
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionOperation.READ, PermissionOperation.ALL]),
        },
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get(':id')
  @CheckId(AccessEntity)
  async getItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
  ) {
    return this.permRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Get('count')
  async getCount(
    @CurrentGroups()
      group: string[],
  ) {
    return this.permRepo.count({
      where: {
        ...this.toWhere(),
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionOperation.READ, PermissionOperation.ALL]),
        },
      },
    }).then(count => ({count}));
  }

  @Post()
  async addItem(
    @Body()
      input: AccessInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new RegistryPermissionInsertOperation(trans).save(input)
        .then(id => trans.getRepository(AccessEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Put(':id')
  async updateItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
    @Body()
      input: AccessInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new RegistryPermissionUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(AccessEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Delete(':id')
  async deleteItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      async trans => {
        NoDataException.assert(
          await trans.getRepository(AccessEntity).findOne({where: {id}}),
          `Permission with id >> ${id} << not found!`,
        );

        return new RegistryPermissionDeleteOperation(trans).save([id]);
      },
    );
  }

}
