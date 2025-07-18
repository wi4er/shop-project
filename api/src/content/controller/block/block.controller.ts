import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockInput } from '../../input/block/block.input';
import { BlockInsertOperation } from '../../operation/block/block-insert.operation';
import { BlockUpdateOperation } from '../../operation/block/block-update.operation';
import { BlockDeleteOperation } from '../../operation/block/block-delete.operation';
import { BlockView } from '../../view/block.view';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { BlockPatchOperation } from '../../operation/block/block-patch.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CheckPermission } from '../../../personal/guard/check-permission.guard';
import { CheckId } from '../../../common/guard/check-id.guard';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';

@ApiTags('Content block')
@Controller('content/block')
export class BlockController {

  relations = {
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
    string: {attribute: true, lang: true},
    description: {attribute: true, lang: true},
    permission: {group: true},
  } as FindOptionsRelations<BlockEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(BlockEntity)
    private blockRepo: Repository<BlockEntity>,
  ) {
  }

  toView(item: BlockEntity) {
    return new BlockView(item);
  }

  @Get()
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.GET)
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: [BlockView],
  })
  async getList(
    @CurrentGroups()
      group: string[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ): Promise<BlockView[]> {
    return this.blockRepo.find({
      where: {
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
      order: {
        sort: 'DESC',
        updated_at: 'DESC',
      },
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.GET)
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
  @CheckId(BlockEntity)
  @CheckPermission(Block2permissionEntity, PermissionMethod.READ)
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.GET)
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: BlockView,
  })
  async getItem(
    @Param('id')
      id: string,
  ): Promise<BlockView> {
    return this.blockRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.POST)
  @ApiResponse({
    status: 201,
    description: 'Content block created successfully',
    type: BlockView,
  })
  async addItem(
    @Body()
      input: BlockInput,
  ): Promise<BlockView> {
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
  @CheckId(BlockEntity)
  @CheckPermission(Block2permissionEntity, PermissionMethod.WRITE)
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.PUT)
  @ApiResponse({
    status: 200,
    description: 'Content block',
    type: BlockView,
  })
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: BlockInput,
  ): Promise<BlockView> {
    return this.entityManager.transaction(
      trans => new BlockUpdateOperation(trans).save(id, input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Patch(':id')
  @CheckId(BlockEntity)
  @CheckPermission(Block2permissionEntity, PermissionMethod.WRITE)
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.PUT)
  async updateField(
    @Param('id')
      id: string,
    @Body()
      input: BlockInput,
  ) {
    return this.entityManager.transaction(
      trans => new BlockPatchOperation(trans).save(id, input)
        .then(id => trans.getRepository(BlockEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete('/:id')
  @CheckId(BlockEntity)
  @CheckPermission(Block2permissionEntity, PermissionMethod.DELETE)
  @CheckAccess(AccessTarget.BLOCK, AccessMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      async trans => new BlockDeleteOperation(trans).save([id]),
    );
  }

}
