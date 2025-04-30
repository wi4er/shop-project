import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AttributeEntity } from '../../model/attribute.entity';
import { AttributeInput } from '../../input/attribute.input';
import { AttributeInsertOperation } from '../../operation/attribute/attribute-insert.operation';
import { AttributeUpdateOperation } from '../../operation/attribute/attribute-update.operation';
import { AttributeDeleteOperation } from '../../operation/attribute/attribute-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { AttributePatchOperation } from '../../operation/attribute/attribute-patch.operation';
import { AttributeRender } from '../../render/attribute.render';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

@Controller('attribute')
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
    return new AttributeRender(item)
  }

  @Get()
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
  async getCount() {
    return this.attributeRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.attributeRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(
      NoDataException.assert(item, `Attribute with id ${id} not found!`)
    ));
  }

  @Post()
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
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new AttributeDeleteOperation(trans).save([id]),
    );
  }

}
