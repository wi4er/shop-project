import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserGroupEntity } from '../../model/user-group.entity';
import { UserGroupInput } from '../../input/user-group.input';
import { UserGroupInsertOperation } from '../../operation/user-group-insert.operation';
import { UserGroupUpdateOperation } from '../../operation/user-group-update.operation';
import { UserGroupDeleteOperation } from '../../operation/user-group-delete.operation';

@Controller('group')
export class GroupController {

  relations = {
    parent: true,
    string: {property: true, lang: true},
    flag: {flag: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(UserGroupEntity)
    private groupRepo: Repository<UserGroupEntity>,
  ) {
  }

  toView(item: UserGroupEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      parent: item.parent?.id,
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
          lang: str.lang?.id,
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
    return this.groupRepo.find({
      relations: {
        string: {property: true, lang: true},
        flag: {flag: true},
      },
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.groupRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
  ) {
    return this.groupRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addItem(
    @Body()
      input: UserGroupInput,
  ) {
    return this.entityManager.transaction(
      trans => new UserGroupInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(UserGroupEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  async updateItem(
    @Param('id')
      id: number,
    @Body()
      input: UserGroupInput,
  ) {
    return this.entityManager.transaction(
      trans => new UserGroupUpdateOperation(trans).save(id, input)
        .then(groupId => trans.getRepository(UserGroupEntity).findOne({
          where: {id: groupId},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  async deleteItem(
    @Param('id')
      id: number,
  ): Promise<number[]> {
    return this.entityManager.transaction(
      trans => new UserGroupDeleteOperation(this.entityManager).save([id]),
    );
  }

}
