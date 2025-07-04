import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FormEntity } from '../../model/form/form.entity';
import { FormInput } from '../../input/form/form.input';
import { FormInsertOperation } from '../../operation/form/form-insert.operation';
import { FormUpdateOperation } from '../../operation/form/form-update.operation';
import { FormDeleteOperation } from '../../operation/form/form-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

@Controller('form')
export class FormController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<FormEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FormEntity)
    private formRepo: Repository<FormEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: FormEntity) {
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
