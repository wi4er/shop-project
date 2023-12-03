import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

@ApiTags('Content')
@Controller('element')
export class ElementController {

  relations = {
    string: {property: true, lang: true},
    section: true,
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
    block: true,
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ElementEntity)
    private elementRepo: Repository<ElementEntity>,
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
          property: str.property.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          property: val.property.id,
          point: val.point.id,
          directory: val.point.directory.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
      section: item.section?.map(sec => sec.id),
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
      where: filter ? this.toWhere(filter) : null,
      order: sort ? this.toOrder(sort) : null,
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount(
    @Query('filter')
      filter?: ElementFilterSchema,
  ) {
    return this.elementRepo.count({
      where: filter ? this.toWhere(filter) : null,
    }).then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.elementRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  addItem(
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
  updateItem(
    @Param('id')
      elementId: number,
    @Body()
      input: ElementInput,
  ) {
    return this.entityManager.transaction(
      trans => new ElementUpdateOperation(trans).save(elementId, input)
        .then(id => trans.getRepository(ElementEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  async deleteItem(
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      trans => new ElementDeleteOperation(trans).save([id])
    );
  }

}
