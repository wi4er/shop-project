import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AttributeEntity } from '../../model/attribute.entity';
import { AttributeInput } from '../../input/attribute.input';
import { AttributeInsertOperation } from '../../operation/attribute-insert.operation';
import { AttributeUpdateOperation } from '../../operation/attribute-update.operation';
import { AttributeDeleteOperation } from '../../operation/attribute-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { AttributePatchOperation } from '../../operation/attribute-patch.operation';

@Controller('attribute')
export class AttributeController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(AttributeEntity)
    private propertyRepo: Repository<AttributeEntity>,
  ) {
  }

  toView(item: AttributeEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      attribute: [
        ...item.string.map(str => ({
          string: str.string,
          attribute: str.attribute.id,
          lang: str.lang?.id,
        })),
      ],
      flag: item.flag.map(fl => fl.flag.id),
    };
  }

  @Get()
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.propertyRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.propertyRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.propertyRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(
      NoDataException.assert(item, `Property with id ${id} not found!`)
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
