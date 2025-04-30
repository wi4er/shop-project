import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { ConfigurationEntity } from '../../model/configuration.entity';
import { ConfigurationInsertOperation } from '../../operation/configuration/configuration-insert.operation';
import { ConfigurationInput } from '../../input/configuration.input';
import { ConfigurationUpdateOperation } from '../../operation/configuration/configuration-update.operation';
import { ConfigurationDeleteOperation } from '../../operation/configuration/configuration-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

@Controller('config')
export class ConfigurationController {

  relations = {
  } as FindOptionsRelations<ConfigurationEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(ConfigurationEntity)
    private configRepo: Repository<ConfigurationEntity>,
  ) {
  }

  toView(item: ConfigurationEntity) {
    return {
      id: item.id,
      value: item.value,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
    };
  }

  @Get()
  getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.configRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  getCount() {
    return this.configRepo.count().then(count => ({count}));
  }

  @Get(':id')
  getItem(
    @Param('id')
      id: string,
  ) {
    return this.configRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => this.toView(NoDataException.assert(item, `Configuration with id ${id} not found`)));
  }

  @Post()
  addItem(
    @Body()
      input: ConfigurationInput,
  ) {
    return this.entityManager.transaction(
      trans => new ConfigurationInsertOperation(trans).save(input)
        .then(id => trans.getRepository(ConfigurationEntity).findOne({
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
      input: ConfigurationInput,
  ) {
    return this.entityManager.transaction(
      trans => new ConfigurationUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(ConfigurationEntity).findOne({
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
      trans => new ConfigurationDeleteOperation(trans).save([id]),
    );
  }

}
