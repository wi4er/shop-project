import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BlockEntity } from '../../model/block.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { BlockInput } from '../../input/block.input';
import { BlockInsertOperation } from '../../operation/block-insert.operation';
import { BlockUpdateOperation } from '../../operation/block-update.operation';
import { BlockDeleteOperation } from '../../operation/block-delete.operation';

@ApiTags('Content block')
@Controller('block')
export class BlockController {

  relations = {
    string: {property: true},
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(BlockEntity)
    private blockRepo: Repository<BlockEntity>,
  ) {
  }

  toView(item: BlockEntity) {
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
        ...item.point.map(val => ({
          property: val.property.id,
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
    return this.blockRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.blockRepo.count({}).then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.blockRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  addItem(
    @Body()
      input: BlockInput,
  ) {
    return this.entityManager.transaction(
      trans => new BlockInsertOperation(trans).save(input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  updateItem(
    @Param('id')
      blockId: number,
    @Body()
      input: BlockInput,
  ) {
    return this.entityManager.transaction(
      trans => new BlockUpdateOperation(trans).save(blockId, input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  async deleteItem(
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      trans => new BlockDeleteOperation(trans).save([id])
    );
  }

}
