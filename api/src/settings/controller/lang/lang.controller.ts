import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LangEntity } from '../../model/lang.entity';
import { FlagInput } from '../../input/flag.input';
import { LangInput } from '../../input/lang.input';
import { LangInsertOperation } from '../../operation/lang-insert.operation';
import { LangUpdateOperation } from '../../operation/lang-update.operation';
import { LangDeleteOperation } from '../../operation/lang-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';

@Controller('lang')
export class LangController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(LangEntity)
    private langRepo: Repository<LangEntity>,
  ) {
  }

  toView(item: LangEntity) {
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
    return this.langRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async countList() {
    return this.langRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.langRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(NoDataException.assert(item, `Lang with id ${id} not found!`)));
  }

  @Post()
  addItem(
    @Body()
      input: LangInput,
  ) {
    return this.entityManager.transaction(
      trans => new LangInsertOperation(trans).save(input)
        .then(id => trans.getRepository(LangEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  updateItem(
    @Param('id')
      id: string,
    @Body()
      input: FlagInput,
  ) {
    return this.entityManager.transaction(
      trans => new LangUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(LangEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }


  @Delete('/:id')
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new LangDeleteOperation(trans).save([id]),
    );
  }

}
