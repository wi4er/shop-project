import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GroupEntity } from '../../model/group/group.entity';
import { GroupInput } from '../../input/group/group.input';
import { GroupInsertOperation } from '../../operation/group/group-insert.operation';
import { GroupUpdateOperation } from '../../operation/group/group-update.operation';
import { GroupDeleteOperation } from '../../operation/group/group-delete.operation';
import { GroupView } from '../../view/group.view';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CheckId } from '../../../common/guard/check-id.guard';

@Controller('personal/group')
export class GroupController {

  relations = {
    parent: true,
    flag: {flag: true},
    string: {attribute: true, lang: true},
  } as FindOptionsRelations<GroupEntity>;

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
    }).then(list => list.map(item => new GroupView(item)));
  }

  @Get('count')
  async getCount() {
    return this.groupRepo.count().then(count => ({count}));
  }

  @Get(':id')
  @CheckId(GroupEntity)
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.groupRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(item => new GroupView(item));
  }

  @Post()
  async addItem(
    @Body()
      input: GroupInput,
  ) {
    return this.entityManager.transaction(
      trans => new GroupInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(GroupEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(item => new GroupView(item));
  }

  @Put(':id')
  @CheckId(GroupEntity)
  async updateItem(
    @Param('id')
      id: string,
    @Body()
      input: GroupInput,
  ) {
    return this.entityManager.transaction(
      trans => new GroupUpdateOperation(trans).save(id, input)
        .then(groupId => trans.getRepository(GroupEntity).findOne({
          where: {id: groupId},
          relations: this.relations,
        })),
    ).then(item => new GroupView(item));
  }

  @Delete(':id')
  @CheckId(GroupEntity)
  async deleteItem(
    @Param('id')
      id: string,
  ): Promise<string[]> {
    return this.entityManager.transaction(
      async trans => new GroupDeleteOperation(trans).save([id]),
    );
  }

}
