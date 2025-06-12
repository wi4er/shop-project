import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { ElementEntity } from '../../model/element/element.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { ElementInput } from '../../input/element.input';
import { ElementFilterInput } from '../../input/element-filter.input';
import { ElementOrder } from '../../input/element.order';
import { ElementInsertOperation } from '../../operation/element/element-insert.operation';
import { ElementUpdateOperation } from '../../operation/element/element-update.operation';
import { ElementDeleteOperation } from '../../operation/element/element-delete.operation';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { ElementRender } from '../../render/element.render';
import { ElementPatchOperation } from '../../operation/element/element-patch.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CheckId } from '../../../common/guard/check-id.guard';
import { CheckPermission } from '../../../personal/guard/check-permission.guard';

@ApiTags('Content element')
@Controller('content/element')
export class ElementController {

  relations = {
    block: true,
    parent: {section: true},
    flag: {flag: true},
    permission: {group: true},
    image: {image: {collection: true}},
    string: {attribute: true, lang: true},
    description: {attribute: true, lang: true},
    interval: {attribute: true},
    point: {point: {directory: true}, attribute: true},
    element: {element: true, attribute: true},
    section: {section: true, attribute: true},
    file: {file: true, attribute: true},
  } as FindOptionsRelations<ElementEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ElementEntity)
    private elementRepo: Repository<ElementEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: ElementEntity) {
    return new ElementRender(item);
  }

  /**
   *
   */
  toWhere(filter: ElementFilterInput): FindOptionsWhere<ElementEntity> {
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

  /**
   *
   */
  toOrder(sort: ElementOrder[]): FindOptionsOrder<ElementEntity> {
    const order = {};

    if (!Array.isArray(sort)) sort = [sort];

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

        if (key === 'created_at') {
          order['created_at'] = item[key];
        }

        if (key === 'sort') {
          order['sort'] = item[key];
        }

        if (key === 'version') {
          order['version'] = item[key];
        }
      }
    }

    return order;
  }

  @ApiResponse({
    status: 200,
    description: 'Content element',
    type: [ElementRender],
  })
  @Get()
  async getList(
    @CurrentGroups()
      group: string[],
    @Query('filter')
      filter?: ElementFilterInput,
    @Query('sort')
      sort?: ElementOrder[],
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
      group: string[],
    @Query('filter')
      filter?: ElementFilterInput,
  ): Promise<{ count: number }> {
    return this.elementRepo.count({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
    }).then(count => ({count}));
  }

  @Get(':id')
  @CheckId(ElementEntity)
  @CheckPermission(Element2permissionEntity, PermissionMethod.READ)
  @ApiResponse({
    status: 200,
    description: 'Content element',
    type: ElementRender,
  })
  async getItem(
    @Param('id')
      id: string,
  ): Promise<ElementRender> {
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
  @CheckId(ElementEntity)
  @CheckPermission(Element2permissionEntity, PermissionMethod.WRITE)
  @ApiResponse({
    status: 200,
    description: 'Content element updated successfully',
    type: ElementRender,
  })
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: ElementInput,
  ): Promise<ElementRender> {
    return this.entityManager.transaction(
      trans => new ElementUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(ElementEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Patch(':id')
  @CheckId(ElementEntity)
  @CheckPermission(Element2permissionEntity, PermissionMethod.WRITE)
  @ApiResponse({
    status: 200,
    description: 'Content element updated successfully',
    type: ElementRender,
  })
  async updateField(
    @Param('id')
      id: string,
    @Body()
      input: ElementInput,
  ): Promise<ElementRender> {
    return this.entityManager.transaction(
      trans => new ElementPatchOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(ElementEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  @CheckId(ElementEntity)
  @CheckPermission(Element2permissionEntity, PermissionMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => new ElementDeleteOperation(trans).save([id]),
    );
  }

}
