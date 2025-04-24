import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { SectionEntity } from '../../model/section.entity';
import { SectionFilterInput } from '../../input/section-filter.input';
import { SectionInput } from '../../input/section.input';
import { SectionInsertOperation } from '../../operation/section-insert.operation';
import { SectionUpdateOperation } from '../../operation/section-update.operation';
import { SectionDeleteOperation } from '../../operation/section-delete.operation';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SectionRender } from '../../render/section.render';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { SectionOrderInput } from '../../input/section-order.input';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { Section2permissionEntity } from '../../model/section2permission.entity';
import { SectionPatchOperation } from '../../operation/section-patch.operation';

@ApiTags('Content section')
@ApiCookieAuth()
@Controller('section')
export class SectionController {

  relations = {
    parent: true,
    block: true,
    flag: {flag: true},
    image: {image: {collection: true}},
    point: {point: {directory: true}, attribute: true},
    string: {attribute: true, lang: true},
    permission: {group: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
    @InjectRepository(Section2permissionEntity)
    private permRepo: Repository<Section2permissionEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: SectionEntity) {
    return new SectionRender(item);
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
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
  ): Promise<SectionRender> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      }),
      `Permission denied!`,
    );

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
  async addItem(
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
  async updateItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
    @Body()
      input: SectionInput,
  ): Promise<SectionRender> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied!`,
    );

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
    type: SectionRender,
  })
  @Patch(':id')
  async updateFields(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
    @Body()
      input: SectionInput,
  ): Promise<SectionRender> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied!`,
    );

    return this.entityManager.transaction(
      trans => new SectionPatchOperation(trans).save(id, input)
        .then(id => trans.getRepository(SectionEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  async deleteItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
  ): Promise<number[]> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.DELETE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied!`,
    );

    return this.entityManager.transaction(
      trans => new SectionDeleteOperation(trans).save([id]),
    );
  }

}
