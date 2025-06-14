import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { DirectoryInput } from '../../input/directory/directory.input';
import { DirectoryInsertOperation } from '../../operation/directory/directory-insert.operation';
import { DirectoryUpdateOperation } from '../../operation/directory/directory-update.operation';
import { DirectoryDeleteOperation } from '../../operation/directory/directory-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { DirectoryView } from '../../view/directory.view';
import { DirectoryPatchOperation } from '../../operation/directory/directory-patch.operation';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { CheckId } from '../../../common/guard/check-id.guard';
import { CheckAccess } from '../../../personal/guard/check-access.guard';
import { AccessTarget } from '../../../personal/model/access/access-target';
import { AccessMethod } from '../../../personal/model/access/access-method';
import { CheckPermission } from '../../../personal/guard/check-permission.guard';

@Controller('registry/directory')
export class DirectoryController {

  relations = {
    string: {attribute: true, lang: true},
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
    permission: {group: true},
  } as FindOptionsRelations<DirectoryEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(DirectoryEntity)
    private directoryRepo: Repository<DirectoryEntity>,
  ) {
  }

  toView(item: DirectoryEntity): DirectoryView {
    return new DirectoryView(item);
  }

  /**
   *
   */
  toWhere(): FindOptionsWhere<DirectoryEntity> {
    const where = {};

    return where;
  }

  @Get()
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.GET)
  async getList(
    @CurrentGroups()
      group: string[],
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.directoryRepo.find({
      where: {
        ...this.toWhere(),
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
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.GET)
  async getCount(
    @CurrentGroups()
      group: string[],
  ) {
    return this.directoryRepo.count({
      where: {
        ...this.toWhere(),
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      },
    }).then(count => ({count}));
  }

  @Get(':id')
  @CheckId(DirectoryEntity)
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.GET)
  @CheckPermission(Directory2permissionEntity, PermissionMethod.READ)
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.directoryRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.POST)
  async addItem(
    @Body()
      input: DirectoryInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new DirectoryInsertOperation(trans).save(input)
        .then(id => trans.getRepository(DirectoryEntity).findOne({
          where: {id},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Put(':id')
  @CheckId(DirectoryEntity)
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.PUT)
  @CheckPermission(Directory2permissionEntity, PermissionMethod.WRITE)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: DirectoryInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new DirectoryUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(DirectoryEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Patch(':id')
  @CheckId(DirectoryEntity)
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.PUT)
  @CheckPermission(Directory2permissionEntity, PermissionMethod.WRITE)
  async updateField(
    @Param('id')
      id: string,
    @Body()
      input: DirectoryInput,
  ) {
    const item = await this.entityManager.transaction(
      trans => new DirectoryPatchOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(DirectoryEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Delete(':id')
  @CheckId(DirectoryEntity)
  @CheckAccess(AccessTarget.DIRECTORY, AccessMethod.DELETE)
  @CheckPermission(Directory2permissionEntity, PermissionMethod.DELETE)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans =>  new DirectoryDeleteOperation(trans).save([id]),
    );
  }

}
