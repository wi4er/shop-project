import { Controller, Get, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultEntity } from '../../model/result.entity';
import { ResultFilterInput } from '../../input/result-filter.input';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Controller('result')
export class ResultController {

  relations = {
    form: true,
  };

  constructor(
    @InjectRepository(ResultEntity)
    private resRepo: Repository<ResultEntity>,
  ) {
  }

  toView(item: ResultEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      form: item.form.id,
    };
  }

  toWhere(filter: ResultFilterInput): FindOptionsWhere<ResultEntity> {
    const where = {};

    if (filter?.form) {
      where['form'] = {id: filter.form};
    }

    return where;
  }

  @Get()
  async getList(
    @Query('filter')
      filter?: ResultFilterInput,
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.resRepo.find({
      where: filter ? this.toWhere(filter) : null,
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.resRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.resRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

}
