import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementEntity } from '../../model/element.entity';
import { ApiTags } from '@nestjs/swagger';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { ElementService } from '../../service/element/element.service';
import { ElementInput } from '../../input/element.input';
import { ElementFilterSchema } from '../../schema/element-filter.schema';
import { ElementOrderSchema } from '../../schema/element-order.schema';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

@ApiTags('Content')
@Controller('element')
export class ElementController {

  constructor(
    @InjectRepository(ElementEntity)
    private elementRepo: Repository<ElementEntity>,
    private elementService: ElementService,
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
      relations: {
        string: {property: true, lang: true},
        section: true,
        flag: {flag: true},
        point: {point: {directory: true}, property: true},
        block: true,
      },
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
      relations: {
        string: {property: true, lang: true},
        section: true,
        flag: {flag: true},
        point: {point: {directory: true}, property: true},
        block: true,
      },
    }).then(this.toView);
  }

  @Post()
  addItem(
    @Body()
      input: ElementInput,
  ) {
    return this.elementService.insert(input)
      .then(res => this.elementRepo.findOne({
        where: {id: res.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
          point: {point: {directory: true}, property: true},
          block: true,
        },
      }))
      .then(res => this.toView(res))
      .catch(err => {
        WrongDataException.assert(err.column !== 'blockId', 'Wrong block id!');
        throw err;
      });
  }

  @Put()
  async updateItem(
    @Body()
      input: ElementInput,
  ) {
    return this.elementService.update(input)
      .then(res => this.elementRepo.findOne({
        where: {id: res.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
          point: {point: {directory: true}, property: true},
          block: true,
        },
      }))
      .then(res => this.toView(res));
  }

  @Delete('/:id')
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<number[]> {
    return this.elementService.delete([+id]);
  }

}
