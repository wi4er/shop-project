import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BlockEntity } from '../../model/block.entity';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockInput } from '../../input/block.input';
import { BlockInsertOperation } from '../../operation/block/block-insert.operation';
import { BlockUpdateOperation } from '../../operation/block/block-update.operation';
import { BlockDeleteOperation } from '../../operation/block/block-delete.operation';
import { BlockRender } from '../../render/block.render';
import { Block2permissionEntity } from '../../model/block2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { BlockPatchOperation } from '../../operation/block/block-patch.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

@ApiTags('Content block')
@Controller('block')
export class BlockController {

  relations = {
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
    string: {attribute: true, lang: true},
    permission: {group: true},
  } as FindOptionsRelations<BlockEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(BlockEntity)
    private blockRepo: Repository<BlockEntity>,
    @InjectRepository(Block2permissionEntity)
    private permRepo: Repository<Block2permissionEntity>,
  ) {
  }

  toView(item: BlockEntity) {
    return new BlockRender(item);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: [BlockRender],
  })
  async getList(
    @CurrentGroups()
      group: string[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ): Promise<BlockRender[]> {
    return this.blockRepo.find({
      where: {
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount(
    @CurrentGroups()
      group: string[],
  ) {
    return this.blockRepo.count({
      where: {
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
    }).then(count => ({count}));
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: BlockRender,
  })
  async getItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
  ): Promise<BlockRender> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

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
  async addItem(
    @Body()
      input: BlockInput,
  ): Promise<BlockRender> {
    const item = await this.entityManager.transaction(
      trans => new BlockInsertOperation(trans).save(input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    );

    return this.toView(item);
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: BlockRender,
  })
  async updateItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
    @Body()
      input: BlockInput,
  ): Promise<BlockRender> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    return this.entityManager.transaction(
      trans => new BlockUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Patch(':id')
  async updateField(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
    @Body()
      input: BlockInput,
  ) {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    return this.entityManager.transaction(
      trans => new BlockPatchOperation(trans).save(id, input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  async deleteItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: number,
  ): Promise<number[]> {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionMethod.DELETE, PermissionMethod.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    return this.entityManager.transaction(
      trans => new BlockDeleteOperation(trans).save([id]),
    );
  }

}
