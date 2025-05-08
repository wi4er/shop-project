import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { RegistryPermissionEntity } from '../../model/registry-permission.entity';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { PermissionOperation } from '../../../permission/model/permission-operation';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { RegistryPermissionRender } from '../../render/registry-permission.render';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { RegistryPermissionInput } from '../../input/registry-permission.input';
import { RegistryPermissionInsertOperation } from '../../operation/permission/registry-permission-insert.operation';
import { RegistryPermissionUpdateOperation } from '../../operation/permission/registry-permission-update.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { RegistryPermissionDeleteOperation } from '../../operation/permission/registry-permission-delete.operation';

@Controller('registry/permission')
export class RegistryPermissionController {

  relations = {
    permission: {group: true},
  } as FindOptionsRelations<RegistryPermissionEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(RegistryPermissionEntity)
    private permRepo: Repository<RegistryPermissionEntity>,
  ) {
  }

  toView(item: RegistryPermissionEntity): RegistryPermissionRender {
    return new RegistryPermissionRender(item);
  }

  /**
   *
   */
  toWhere(): FindOptionsWhere<RegistryPermissionEntity> {
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
      input: RegistryPermissionInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new RegistryPermissionInsertOperation(trans).save(input)
        .then(id => trans.getRepository(RegistryPermissionEntity).findOne({
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
      input: RegistryPermissionInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new RegistryPermissionUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(RegistryPermissionEntity).findOne({
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
          await trans.getRepository(RegistryPermissionEntity).findOne({where: {id}}),
          `Permission with id >> ${id} << not found!`,
        );

        return new RegistryPermissionDeleteOperation(trans).save([id]);
      },
    );
  }

}
