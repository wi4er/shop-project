import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PointEntity } from '../../model/point.entity';
import { PointInsertOperation } from '../../operation/point-insert.operation';
import { PointInput } from '../../input/point.input';
import { PointUpdateOperation } from '../../operation/point-update.operation';
import { PointDeleteOperation } from '../../operation/point-delete.operation';

@Controller('point')
export class PointController {

  relations = {
    directory: true,
    string: {attribute: true, lang: true},
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(PointEntity)
    private pointRepo: Repository<PointEntity>,
  ) {
  }

  toView(item: PointEntity) {
    return {
      id: item.id,
      directory: item.directory.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      attribute: [
        ...item.string.map(str => ({
          string: str.string,
          attribute: str.attribute.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          attribute: val.attribute.id,
          point: val.point.id,
          directory: val.point.directory.id,
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
    return this.pointRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.pointRepo.count().then(count => ({count}));
  }

  @Post()
  addItem(
    @Body()
      input: PointInput,
  ) {
    return this.entityManager.transaction(
      trans => new PointInsertOperation(trans).save(input)
        .then(id => trans.getRepository(PointEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  updateItem(
    @Param('id')
      pointId: string,
    @Body()
      input: PointInput,
  ) {
    return this.entityManager.transaction(
      trans => new PointUpdateOperation(trans).save(pointId, input)
        .then(id => trans.getRepository(PointEntity).findOne({
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
      trans => new PointDeleteOperation(trans).save([id])
    );
  }

}
