import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FlagEntity } from '../../model/flag.entity';
import { FlagInput } from '../../input/flag.input';
import { FlagInsertOperation } from '../../operation/flag-insert.operation';
import { FlagUpdateOperation } from '../../operation/flag-update.operation';
import { FlagDeleteOperation } from '../../operation/flag-delete.operation';
import { NoDataException } from '../../../exception/no-data/no-data.exception';

@Controller('flag')
export class FlagController {

  relations = {
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(FlagEntity)
    private flagRepo: Repository<FlagEntity>,
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
  getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.flagRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  getCount() {
    return this.flagRepo.count().then(count => ({count}));
  }

  @Get(':id')
  getItem(
    @Param('id')
      id: string,
  ) {
    return this.flagRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(NoDataException.assert(item, `Flag with id ${id} not found`)));
  }

  @Post()
  addItem(
    @Body()
      input: FlagInput,
  ) {
    return this.entityManager.transaction(
      trans => new FlagInsertOperation(trans).save(input)
        .then(id => trans.getRepository(FlagEntity).findOne({
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
      trans => new FlagUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(FlagEntity).findOne({
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
      trans => new FlagDeleteOperation(trans).save([id]),
    );
  }

}
