import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ElementEntity } from '../../model/element.entity';
import { ApiTags } from '@nestjs/swagger';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { ElementInput } from '../../input/element.input';
import { ElementFilterSchema } from '../../schema/element-filter.schema';
import { ElementOrderSchema } from '../../schema/element-order.schema';
import { ElementInsertOperation } from '../../operation/element-insert.operation';
import { ElementUpdateOperation } from '../../operation/element-update.operation';
import { ElementDeleteOperation } from '../../operation/element-delete.operation';
import { ElementPermissionEntity } from '../../model/element-permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Request } from 'express';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { CurrentGroups } from '../../../user/decorator/current-groups/current-groups.decorator';

@ApiTags('Content element')
@Controller('element')
export class ElementController {

  relations = {
    string: {property: true, lang: true},
    section: true,
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
    element: {element: true, property: true},
    permission: {group: true},
    block: true,
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ElementEntity)
    private elementRepo: Repository<ElementEntity>,
    @InjectRepository(ElementPermissionEntity)
    private permRepo: Repository<ElementPermissionEntity>,
  ) {
  }

  toView(item: ElementEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      block: item.block.id,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          proper6ty: str.property.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          property: val.property.id,
          point: val.point.id,
          directory: val.point.directory.id,
        })),
        ...item.element.map(val => ({
          property: val.property.id,
          element: val.element.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
      section: item.section?.map(sec => sec.id),
      permission: item.permission?.map(it => ({
        method: it.method,
        group: it.group.id,
      })),
    };
  }

  toWhere(filter: ElementFilterSchema): FindOptionsWhere<ElementEntity> {
    const where = {};

    if (filter?.block) {
      where['block'] = {id: filter.block};
    }

    if (filter?.flag) {
      where['flag'] = {flag: {id: filter.flag.eq}};
    }

    for (const key in filter?.point) {
      where['point'] = {
        point: {directory: {id: key}, id: filter.point[key].eq},
      };
    }

    if (filter?.string) {
      where['string'] = {string: filter.string.eq};
    }

    return where;
  }

  toOrder(sort: ElementOrderSchema[]): FindOptionsOrder<ElementEntity> {
    const order = {};

    if (!Array.isArray(sort)) {
      sort = [sort];
    }

    for (const item of sort) {
      for (const key in item) {
        if (key === 'value') {
          if (!order['value']) {
            order['value'] = {};
          }
        }

        if (key === 'string') {
          order['string'] = {string: 'asc'};
        }
      }
    }

    return order;
  }

  @Get()
  async getList(
    @CurrentGroups()
      group: number[],
    @Query('filter')
      filter?: ElementFilterSchema,
    @Query('sort')
      sort?: ElementOrderSchema[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.elementRepo.find({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
        permission: {
          group: In(group),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      order: sort ? this.toOrder(sort) : null,
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount(
    @CurrentGroups()
      group: number[],
    @Query('filter')
      filter?: ElementFilterSchema,
  ) {
    return this.elementRepo.count({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
        permission: {
          group: In(group),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
    }).then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @CurrentGroups()
      group: number[],
    @Param('id')
      id: number,
    @Req()
      req: Request,
  ) {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: In(group),
          parent: {id},
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    return this.elementRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @CurrentGroups()
      group: number[],
    @Body()
      input: ElementInput,
  ) {
    return this.entityManager.transaction(
      trans => new ElementInsertOperation(trans).save(input)
        .then(id => trans.getRepository(ElementEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @CurrentGroups()
      group: number[],
    @Param('id')
      id: number,
    @Body()
      input: ElementInput,
  ) {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: In(group),
          parent: {id},
          method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied!`,
    );

    return this.entityManager.transaction(
      trans => new ElementUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(ElementEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  async deleteItem(
    @CurrentGroups()
      group: number[],
    @Param('id')
      id: number,
  ): Promise<number[]> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: In(group),
          parent: {id},
          method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied!`,
    );

    return this.entityManager.transaction(
      trans => new ElementDeleteOperation(trans).save([id]),
    );
  }

}
