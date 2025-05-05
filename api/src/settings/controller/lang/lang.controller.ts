import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LangEntity } from '../../model/lang.entity';
import { FlagInput } from '../../input/flag.input';
import { LangInput } from '../../input/lang.input';
import { LangInsertOperation } from '../../operation/lang/lang-insert.operation';
import { LangUpdateOperation } from '../../operation/lang/lang-update.operation';
import { LangDeleteOperation } from '../../operation/lang/lang-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { LangRender } from '../../render/lang.render';
import { ElementEntity } from '../../../content/model/element.entity';

@Controller('lang')
export class LangController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
  } as FindOptionsRelations<LangEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(LangEntity)
    private langRepo: Repository<LangEntity>,
  ) {
  }

  toView(item: LangEntity) {
    return new LangRender(item);
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
      async trans => {
        NoDataException.assert(
          await trans.getRepository(LangEntity).findOne({where: {id}}),
          `Language with id >> ${id} << not found!`,
        );

        return new LangDeleteOperation(trans).save([id]);
      },
    );
  }

}
