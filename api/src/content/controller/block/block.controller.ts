import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BlockEntity } from '../../model/block.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockInput } from '../../input/block.input';
import { BlockInsertOperation } from '../../operation/block-insert.operation';
import { BlockUpdateOperation } from '../../operation/block-update.operation';
import { BlockDeleteOperation } from '../../operation/block-delete.operation';
import { BlockRender } from '../../render/block.render';

@ApiTags('Content block')
@Controller('block')
export class BlockController {

  relations = {
    string: {property: true, lang: true},
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
    return new BlockRender(item)
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: [BlockRender],
  })
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ): Promise<BlockRender[]> {
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
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: BlockRender,
  })
  async getItem(
    @Param('id')
      id: number,
  ): Promise<BlockRender> {
    return this.blockRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Content block created successfully',
    type: BlockRender,
  })
  addItem(
    @Body()
      input: BlockInput,
  ): Promise<BlockRender> {
    return this.entityManager.transaction(
      trans => new BlockInsertOperation(trans).save(input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: BlockRender,
  })
  updateItem(
    @Param('id')
      blockId: number,
    @Body()
      input: BlockInput,
  ): Promise<BlockRender> {
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
