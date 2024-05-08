import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SectionEntity } from '../../model/section.entity';
import { SectionFilterInput } from '../../input/section-filter.input';
import { SectionInput } from '../../input/section.input';
import { SectionInsertOperation } from '../../operation/section-insert.operation';
import { SectionUpdateOperation } from '../../operation/section-update.operation';
import { SectionDeleteOperation } from '../../operation/section-delete.operation';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SectionRender } from '../../render/section.render';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { ElementEntity } from '../../model/element.entity';
import { SectionOrderInput } from '../../input/section-order.input';

@ApiTags('Content section')
@ApiCookieAuth()
@Controller('section')
export class SectionController {

  relations = {
    parent: true,
    image: {image: {collection: true}},
    string: {property: true, lang: true},
    block: true,
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
  ) {
  }

  toView(item: SectionEntity) {
    return new SectionRender(item);
  }

  toOrder(sort: SectionOrderInput[]): FindOptionsOrder<ElementEntity> {
    const order = {};

    if (!Array.isArray(sort)) sort = [sort];

    for (const item of sort) {
      for (const key in item) {
        if (key === 'sort') {
          order['sort'] = item[key]
        }

        if (key === 'created_at') {
          order['created_at'] = item[key];
        }

        if (key === 'version') {
          order['version'] = item[key]
        }
      }
    }

    return order;
  }

  @ApiParam({
    name: 'offset',
    required: false,
  })
  @ApiParam({
    name: 'limit',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Content section',
    type: [SectionRender],
  })
  @Get()
  async getList(
    @Query('filter')
      filter?: SectionFilterInput,
    @Query('sort')
      sort?: SectionOrderInput[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ): Promise<SectionRender[]> {
    const where = {};

    if (filter?.block) {
      where['block'] = {id: filter.block};
    }

    if (filter?.flag) {
      where['flag'] = {flag: {id: filter.flag.eq}};
    }

    return this.sectionRepo.find({
      where,
      order: sort ? this.toOrder(sort) : null,
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount(
    @Query('filter')
      filter?: SectionFilterInput,
  ): Promise<{ count: number }> {
    const where = {};

    if (filter?.block) {
      where['block'] = {id: filter.block};
    }

    if (filter?.flag) {
      where['flag'] = {flag: {id: filter.flag.eq}};
    }

    return this.sectionRepo.count({where})
      .then(count => ({count}));
  }

  @ApiResponse({
    status: 200,
    description: 'Content section',
    type: SectionRender,
  })
  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ): Promise<SectionRender> {
    return this.sectionRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @ApiResponse({
    status: 201,
    description: 'Content section',
    type: SectionRender,
  })
  @Post()
  addItem(
    @Body()
      input: SectionInput,
  ): Promise<SectionRender> {
    return this.entityManager.transaction(
      trans => new SectionInsertOperation(trans).save(input)
        .then(id => trans.getRepository(SectionEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @ApiResponse({
    status: 200,
    description: 'Content section',
    type: SectionRender,
  })
  @Put(':id')
  updateItem(
    @Param('id')
      sectionId: string,
    @Body()
      input: SectionInput,
  ): Promise<SectionRender> {
    return this.entityManager.transaction(
      trans => new SectionUpdateOperation(trans).save(sectionId, input)
        .then(id => trans.getRepository(SectionEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  deleteItem(
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      trans => new SectionDeleteOperation(trans).save([id]),
    );
  }

}
