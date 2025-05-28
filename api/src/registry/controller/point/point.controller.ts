import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import { PointEntity } from '../../model/point.entity';
import { PointInsertOperation } from '../../operation/point/point-insert.operation';
import { PointInput } from '../../input/point.input';
import { PointUpdateOperation } from '../../operation/point/point-update.operation';
import { PointDeleteOperation } from '../../operation/point/point-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { PointRender } from '../../render/point.render';
import { CurrentGroups } from '../../../personal/decorator/current-groups/current-groups.decorator';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { PermissionMethod } from '../../../permission/model/permission-method';
import { Directory2permissionEntity } from '../../model/directory2permission.entity';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { PointPatchOperation } from '../../operation/point/point-patch.operation';
import { CheckId } from '../../../common/guard/check-id.guard';

@Controller('registry/point')
export class PointController {

  relations = {
    directory: true,
    string: {attribute: true, lang: true},
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
  } as FindOptionsRelations<PointEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(PointEntity)
    private pointRepo: Repository<PointEntity>,
    @InjectRepository(Directory2permissionEntity)
    private permRepo: Repository<Directory2permissionEntity>,
  ) {
  }

  /**
   *
   */
  toView(item: PointEntity) {
    return new PointRender(item);
  }

  /**
   *
   */
  toWhere(): FindOptionsWhere<PointEntity> {
    const where = {};

    return where;
  }

  @Get()
  async getList(
    @CurrentGroups()
      group: string[],
    @Query('directory')
      directory: string,
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.pointRepo.find({
      where: {
        ...this.toWhere(),
        directory: {
          id: directory,
          permission: {
            group: Or(In(group), IsNull()),
            method: In([PermissionMethod.READ, PermissionMethod.ALL]),
          },
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
    return this.pointRepo.count({
      where: {
        ...this.toWhere(),
        directory: {
          permission: {
            group: Or(In(group), IsNull()),
            method: In([PermissionMethod.READ, PermissionMethod.ALL]),
          },
        },
      },
    }).then(count => ({count}));
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

  @Get(':id')
  @CheckId(PointEntity)
  async getItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      id: string,
  ) {
    const item = await this.pointRepo.findOne({
      where: {id},
      relations: this.relations,
    });

    PermissionException.assert(
      await this.permRepo.findOne({
        where: {
          group: Or(In(group), IsNull()),
          parent: {id: item.directory.id},
          method: In([PermissionMethod.READ, PermissionMethod.ALL]),
        },
      }),
      `Permission denied for element ${id}`,
    );

    return this.toView(item);
  }

  @Put(':id')
  @CheckId(PointEntity)
  async updateItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      pointId: string,
    @Body()
      input: PointInput,
  ) {
    const item = await this.entityManager.transaction(
      async trans => {
        const point = await trans.getRepository(PointEntity).findOne({
          where: {id: pointId},
          relations: {directory: true},
        });

        PermissionException.assert(
          await trans.getRepository(Directory2permissionEntity).findOne({
            where: {
              group: Or(In(group), IsNull()),
              parent: {id: point.directory.id},
              method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
            },
          }),
          `Permission denied for directory ${point.directory.id}`,
        );

        return new PointUpdateOperation(trans).save(pointId, input)
          .then(id => trans.getRepository(PointEntity).findOne({
            where: {id},
            relations: this.relations,
          }));
      });

    return this.toView(item);
  }

  @Patch(':id')
  @CheckId(PointEntity)
  async updateField(
    @CurrentGroups()
      group: string[],
    @Param('id')
      pointId: string,
    @Body()
      input: PointInput,
  ) {
    const item = await this.entityManager.transaction(
      async trans => {
        const point = await trans.getRepository(PointEntity).findOne({
          where: {id: pointId},
          relations: {directory: true},
        });

        PermissionException.assert(
          await trans.getRepository(Directory2permissionEntity).findOne({
            where: {
              group: Or(In(group), IsNull()),
              parent: {id: point.directory.id},
              method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
            },
          }),
          `Permission denied for directory ${point.directory.id}`,
        );

        return new PointPatchOperation(trans).save(pointId, input)
          .then(id => trans.getRepository(PointEntity).findOne({
            where: {id},
            relations: this.relations,
          }));
      });

    return this.toView(item);
  }

  @Delete('/:id')
  @CheckId(PointEntity)
  async deleteItem(
    @CurrentGroups()
      group: string[],
    @Param('id')
      pointId: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => {
        const point = await trans.getRepository(PointEntity).findOne({
          where: {id: pointId},
          relations: {directory: true},
        });

        PermissionException.assert(
          await trans.getRepository(Directory2permissionEntity).findOne({
            where: {
              group: Or(In(group), IsNull()),
              parent: {id: point.directory.id},
              method: In([PermissionMethod.WRITE, PermissionMethod.ALL]),
            },
          }),
          `Permission denied for directory ${point.directory.id}`,
        );

        return new PointDeleteOperation(trans).save([pointId]);
      },
    );
  }

}
