import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PropertyEntity } from '../../model/property.entity';
import { PropertyInput } from '../../input/property.input';
import { PropertyInsertOperation } from '../../operation/property-insert.operation';
import { PropertyUpdateOperation } from '../../operation/property-update.operation';
import { PropertyDeleteOperation } from '../../operation/property-delete.operation';

@Controller('property')
export class PropertyController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(PropertyEntity)
    private propertyRepo: Repository<PropertyEntity>,
  ) {
  }

  toView(item: PropertyEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
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
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: PropertyInput,
  ) {
    return this.entityManager.transaction(
      trans => new PropertyInsertOperation(trans).save(input)
        .then(id => trans.getRepository(PropertyEntity).findOne({
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
      input: PropertyInput,
  ) {
    return this.entityManager.transaction(
      trans => new PropertyUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(PropertyEntity).findOne({
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
      trans => new PropertyDeleteOperation(trans).save([id]),
    );
  }

}
