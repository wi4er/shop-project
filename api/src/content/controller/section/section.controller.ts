import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SectionEntity } from '../../model/section/section.entity';
import { SectionFilterInput } from '../../input/section/section-filter.input';
import { SectionInput } from '../../input/section/section.input';
import { SectionInsertOperation } from '../../operation/section/section-insert.operation';
import { SectionUpdateOperation } from '../../operation/section/section-update.operation';
import { SectionDeleteOperation } from '../../operation/section/section-delete.operation';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SectionView } from '../../view/section.view';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { SectionOrderInput } from '../../input/section/section-order.input';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';
import { SectionPatchOperation } from '../../operation/section/section-patch.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CheckId } from '../../../common/guard/check-id.guard';
import { CheckPermission } from '../../../personal/guard/check-permission.guard';

@ApiTags('Content section')
@ApiCookieAuth()
@Controller('content/section')
export class SectionController {

  relations = {
    parent: true,
    block: true,
    flag: {flag: true},
    image: {image: {collection: true}},
    point: {point: {directory: true}, attribute: true},
    string: {attribute: true, lang: true},
    permission: {group: true},
  } as FindOptionsRelations<SectionEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: SectionEntity) {
    return new SectionView(item);
  }

  /**
   *
   */
  toOrder(sort: SectionOrderInput[]): FindOptionsOrder<SectionEntity> {
    const order = {};

    if (!Array.isArray(sort)) sort = [sort];

    for (const item of sort) {
      for (const key in item) {
        if (key === 'sort') {
          order['sort'] = item[key];
        }

        if (key === 'created_at') {
          order['created_at'] = item[key];
        }

        if (key === 'version') {
          order['version'] = item[key];
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
    type: [SectionView],
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
  ): Promise<SectionView[]> {
    const where = {};

    if (filter?.block) {
      where['block'] = {id: filter.block};
    }

    if (filter?.flag) {
      where['flag'] = {flag: {id: filter.flag.eq}};
    }

    return this.sectionRepo.find({
      where,
      order: sort ? this.toOrder(sort) : {
        sort: 'DESC',
        updated_at: 'DESC',
      },
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
    type: SectionView,
  })
  @Get(':id')
  @CheckId(SectionEntity)
  @CheckPermission(Section2permissionEntity, PermissionMethod.READ)
  async getItem(
    @Param('id')
    id: string,
  ): Promise<SectionView> {
    return this.sectionRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @ApiResponse({
    status: 201,
    description: 'Content section',
    type: SectionView,
  })
  @Post()
  async addItem(
    @Body()
    input: SectionInput,
  ): Promise<SectionView> {
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
    type: SectionView,
  })
  @Put(':id')
  @CheckId(SectionEntity)
  @CheckPermission(Section2permissionEntity, PermissionMethod.WRITE)
  async updateItem(
    @Param('id')
    id: string,
    @Body()
    input: SectionInput,
  ): Promise<SectionView> {
    return this.entityManager.transaction(
      trans => new SectionUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(SectionEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @ApiResponse({
    status: 200,
    description: 'Content section',
    type: SectionView,
  })
  @Patch(':id')
  @CheckId(SectionEntity)
  @CheckPermission(Section2permissionEntity, PermissionMethod.WRITE)
  async updateFields(
    @Param('id')
    id: string,
    @Body()
    input: SectionInput,
  ): Promise<SectionView> {
    return this.entityManager.transaction(
      trans => new SectionPatchOperation(trans).save(id, input)
        .then(id => trans.getRepository(SectionEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  @CheckId(SectionEntity)
  @CheckPermission(Section2permissionEntity, PermissionMethod.DELETE)
  async deleteItem(
    @Param('id')
    id: string,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      async trans => new SectionDeleteOperation(trans).save([id]),
    );
  }

}
