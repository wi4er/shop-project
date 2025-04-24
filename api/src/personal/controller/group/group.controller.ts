import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GroupEntity } from '../../model/group.entity';
import { UserGroupInput } from '../../input/user-group.input';
import { UserGroupInsertOperation } from '../../operation/user-group-insert.operation';
import { UserGroupUpdateOperation } from '../../operation/user-group-update.operation';
import { UserGroupDeleteOperation } from '../../operation/user-group-delete.operation';
import { GroupRender } from '../../render/group.render';

@Controller('group')
export class GroupController {

  relations = {
    parent: true,
    flag: {flag: true},
    string: {attribute: true, lang: true},
  };

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(GroupEntity)
    private groupRepo: Repository<GroupEntity>,
  ) {
  }

  @Get()
  async getList(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.groupRepo.find({
      relations: this.relations,
      take: limit,
      skip: offset,
    }).then(list => list.map(item => new GroupRender(item)));
  }

  @Get('count')
  async getCount() {
    return this.groupRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.groupRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => new GroupRender(item));
  }

  @Post()
  async addItem(
    @Body()
      input: UserGroupInput,
  ) {
    return this.entityManager.transaction(
      trans => new UserGroupInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(GroupEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new GroupRender(item));
  }

  @Put(':id')
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: UserGroupInput,
  ) {
    return this.entityManager.transaction(
      trans => new UserGroupUpdateOperation(trans).save(id, input)
        .then(groupId => trans.getRepository(GroupEntity).findOne({
          where: {id: groupId},
          relations: this.relations,
        })),
    ).then(item => new GroupRender(item));
  }

  @Delete(':id')
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      trans => new UserGroupDeleteOperation(trans).save([id]),
    );
  }

}
