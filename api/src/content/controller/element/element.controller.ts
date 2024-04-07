import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { ElementEntity } from '../../model/element.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { ElementInput } from '../../input/element.input';
import { ElementFilterSchema } from '../../schema/element-filter.schema';
import { ElementOrderSchema } from '../../schema/element-order.schema';
import { ElementInsertOperation } from '../../operation/element-insert.operation';
import { ElementUpdateOperation } from '../../operation/element-update.operation';
import { ElementDeleteOperation } from '../../operation/element-delete.operation';
import { Element2permissionEntity } from '../../model/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { ElementRender } from '../../render/element.render';

@ApiTags('Content element')
@Controller('element')
export class ElementController {

  relations = {
    block: true,
    parent: {section: true},
    permission: {group: true},
    image: {image: {collection: true}},
    string: {property: true, lang: true},
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
    element: {element: true, property: true},
    section: {section: true, property: true},
    file: {file: true, property: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ElementEntity)
    private elementRepo: Repository<ElementEntity>,
    @InjectRepository(Element2permissionEntity)
    private permRepo: Repository<Element2permissionEntity>,
  ) {
  }

  toView(item: ElementEntity) {
    return new ElementRender(item);
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
  @ApiResponse({
    status: 200,
    description: 'Content element',
    type: [ElementRender],
  })
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
  ): Promise<ElementRender[]> {
    return this.elementRepo.find({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
        permission: {
          group: Or(In(group), IsNull()),
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
  ): Promise<{ count: number }> {
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
  @ApiResponse({
    status: 200,
    description: 'Content element',
    type: ElementRender,
  })
  async getItem(
    @CurrentGroups()
      group: number[],
    @Param('id')
      id: number,
  ): Promise<ElementRender> {
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
  @ApiResponse({
    status: 201,
    description: 'Content element created successfully',
    type: ElementRender,
  })
  async addItem(
    @CurrentGroups()
      group: number[],
    @Body()
      input: ElementInput,
  ): Promise<ElementRender> {
    return this.entityManager.transaction(
      trans => new ElementInsertOperation(trans).save(input)
        .then(id => trans.getRepository(ElementEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Content element updated successfully',
    type: ElementRender,
  })
  async updateItem(
    @CurrentGroups()
      group: number[],
    @Param('id')
      id: number,
    @Body()
      input: ElementInput,
  ): Promise<ElementRender> {
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
