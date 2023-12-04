import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FormEntity } from '../../model/form.entity';
import { FormInput } from '../../input/form.input';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { FormInsertOperation } from '../../operation/form-insert.operation';
import { FormUpdateOperation } from '../../operation/form-update.operation';
import { FormDeleteOperation } from '../../operation/form-delete.operation';

@Controller('form')
export class FormController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FormEntity)
    private formRepo: Repository<FormEntity>,
  ) {
  }

  toView(item: FlagEntity) {
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
    return this.formRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.formRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.formRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: FormInput,
  ) {
    return this.entityManager.transaction(
      trans => new FormInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(FormEntity).findOne({
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
      input: FormInput,
  ) {
    return this.entityManager.transaction(
      trans => new FormUpdateOperation(this.entityManager).save(id, input)
        .then(id => trans.getRepository(FormEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new FormDeleteOperation(this.entityManager).save([id]),
    );
  }

}
