import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

@Controller('settings/attribute')
export class AttributeController {

  relations = {
    string: {attribute: true, lang: true},
    asDirectory: {directory: true},
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

  toView(item: AttributeEntity) {
    return new AttributeView(item);
  }

  @Get()
  @CheckAccess(AccessTarget.ATTRIBUTE, AccessMethod.GET)
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.attributeRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
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
    }).then(item => this.toView(item));
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
    ).then(this.toView);
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
    ).then(this.toView);
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
    ).then(this.toView);
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
