import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { AttributeInsertOperation } from '../../operation/attribute/attribute-insert.operation';
import { AttributeUpdateOperation } from '../../operation/attribute/attribute-update.operation';
import { AttributeDeleteOperation } from '../../operation/attribute/attribute-delete.operation';
import { AttributePatchOperation } from '../../operation/attribute/attribute-patch.operation';
import { AttributeView } from '../../view/attribute.view';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckId } from '../../../common/guard/check-id.guard';
import { AttributeFilterInput } from '../../input/attribute/attribute-filter.input';
import { AttributeOrderInput } from '../../input/attribute/attribute-order.input';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Controller('settings/attribute')
export class AttributeController {

  relations = {
    string: {attribute: true, lang: true},
    asPoint: {directory: true},
    asSection: {block: true},
    asElement: {block: true},
    asFile: {collection: true},
    flag: {flag: true},
  } as FindOptionsRelations<AttributeEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(AttributeEntity)
    private attributeRepo: Repository<AttributeEntity>,
  ) {
  }

  toWhere(input: AttributeFilterInput): FindOptionsWhere<AttributeEntity> {
    const where = {};

    if (input.type.eq) {
      where['type'] = input.type.eq;
    }

    if (input.type.in) {
      where['type'] = In(input.type.in.split(';'));
    }

    return where;
  }

  toOrder(input: AttributeOrderInput) {

  }

  @Get()
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.GET)
  async getList(
    @Query('filter')
      filter: AttributeFilterInput,
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.attributeRepo.find({
      where: {
        ...(filter ? this.toWhere(filter) : {}),
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(item => new AttributeView(item)));
  }

  @Get('count')
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.GET)
  async getCount() {
    return this.attributeRepo.count().then(count => ({count}));
  }

  @Get(':id')
  @CheckId(AttributeEntity)
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.GET)
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.attributeRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => new AttributeView(item));
  }

  @Post()
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.POST)
  async addItem(
    @Body()
      input: AttributeInput,
  ) {
    return this.entityManager.transaction(
      trans => new AttributeInsertOperation(trans).save(input)
        .then(id => trans.getRepository(AttributeEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new AttributeView(item));
  }

  @Put(':id')
  @CheckId(AttributeEntity)
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.PUT)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: AttributeInput,
  ) {
    return this.entityManager.transaction(
      trans => new AttributeUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(AttributeEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new AttributeView(item));
  }

  @Patch(':id')
  @CheckId(AttributeEntity)
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.PUT)
  async updateField(
    @Param('id')
      id: string,
    @Body()
      input: AttributeInput,
  ) {
    return this.entityManager.transaction(
      trans => new AttributePatchOperation(trans).save(id, input)
        .then(id => trans.getRepository(AttributeEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new AttributeView(item));
  }

  @Delete(':id')
  @CheckId(AttributeEntity)
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => new AttributeDeleteOperation(trans).save([id]),
    );
  }

}
