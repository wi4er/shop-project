import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { DirectoryInput } from '../../input/directory.input';
import { DirectoryInsertOperation } from '../../operation/directory/directory-insert.operation';
import { DirectoryUpdateOperation } from '../../operation/directory/directory-update.operation';
import { DirectoryDeleteOperation } from '../../operation/directory/directory-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { DirectoryRender } from '../../render/directory.render';
import { DirectoryPatchOperation } from '../../operation/directory/directory-patch.operation';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { PermissionOperation } from '../../../permission/model/permission-operation';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { Directory2permissionEntity } from '../../model/directory2permission.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { ElementEntity } from '../../../content/model/element.entity';

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
    @InjectRepository(Directory2permissionEntity)
    private permRepo: Repository<Directory2permissionEntity>,
  ) {
  }

  toView(item: DirectoryEntity): DirectoryRender {
    return new DirectoryRender(item);
  }

  /**
   *
   */
  toWhere(): FindOptionsWhere<DirectoryEntity> {
    const where = {};


    return where;
  }

  @Get()
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
          method: In([PermissionOperation.READ, PermissionOperation.ALL]),
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
    return this.directoryRepo.count({
      where: {
        ...this.toWhere(),
        permission: {
          group: Or(In(group), IsNull()),
          method: In([PermissionOperation.READ, PermissionOperation.ALL]),
        },
      },
    }).then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
  ) {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionOperation.READ, PermissionOperation.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    return this.directoryRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  addItem(
    @Body()
      input: DirectoryInput,
  ) {
    return this.entityManager.transaction(
      trans => new DirectoryInsertOperation(trans).save(input)
        .then(id => trans.getRepository(DirectoryEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
    @Body()
      input: DirectoryInput,
  ) {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionOperation.WRITE, PermissionOperation.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    const item = await this.entityManager.transaction(
      trans => new DirectoryUpdateOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(DirectoryEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Patch(':id')
  async updateField(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
    @Body()
      input: DirectoryInput,
  ) {
    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id},
          method: In([PermissionOperation.WRITE, PermissionOperation.ALL]),
        },
      }),
      `Permission denied for directory ${id}`,
    );

    const item = await this.entityManager.transaction(
      trans => new DirectoryPatchOperation(trans).save(id, input)
        .then(updatedId => trans.getRepository(DirectoryEntity).findOne({
          where: {id: updatedId},
          relations: this.relations,
        })));

    return this.toView(item);
  }

  @Delete(':id')
  async deleteItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => {
        NoDataException.assert(
          await trans.getRepository(DirectoryEntity).findOne({where: {id}}),
          `Directory with id >> ${id} << not found!`,
        );

        PermissionException.assert(
          await trans.getRepository(Directory2permissionEntity).findOne({
            where: {
              group: Or(In(group), IsNull()),
              parent: {id},
              method: In([PermissionOperation.DELETE, PermissionOperation.ALL]),
            },
          }),
          `Permission denied for directory ${id}`,
        );

        return new DirectoryDeleteOperation(trans).save([id]);
      },
    );
  }

}
