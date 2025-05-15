import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AccessEntity } from '../../model/access/access.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { AccessRender } from '../../render/access.render';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { AccessInput } from '../../input/access.input';
import { AccessInsertOperation } from '../../operation/access/access-insert.operation';
import { AccessUpdateOperation } from '../../operation/access/access-update.operation';
import { AccessDeleteOperation } from '../../operation/access/access-delete.operation';
import { CheckId } from '../../../common/guard/check-id.guard';

@Controller('personal/access')
export class AccessController {

  relations = {
  } as FindOptionsRelations<AccessEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(AccessEntity)
    private accessRepo: Repository<AccessEntity>,
  ) {
  }

  toView(item: AccessEntity): AccessRender {
    return new AccessRender(item);
  }

  /**
   *
   */
  toWhere(): FindOptionsWhere<AccessEntity> {
    const where = {};

    return where;
  }

  @Get()
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.accessRepo.find({
      where: {
        ...this.toWhere(),
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get(':id')
  @CheckId(AccessEntity)
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.accessRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Get('count')
  async getCount() {
    return this.accessRepo.count({
      where: {
        ...this.toWhere(),
      },
    }).then(count => ({count}));
  }

  @Post()
  async addItem(
    @Body()
      input: AccessInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new AccessInsertOperation(trans).save(input)
        .then(id => trans.getRepository(AccessEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Put(':id')
  @CheckId(AccessEntity)
  async updateItem(
    @Param('id')
      id: number,
    @Body()
      input: AccessInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new AccessUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(AccessEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Delete(':id')
  @CheckId(AccessEntity)
  async deleteItem(
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      async trans => new AccessDeleteOperation(trans).save([id]),
    );
  }

}
