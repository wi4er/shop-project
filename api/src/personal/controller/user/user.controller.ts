import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../model/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserInput } from '../../input/user.input';
import { UserInsertOperation } from '../../operation/user/user-insert.operation';
import { UserUpdateOperation } from '../../operation/user/user-update.operation';
import { UserDeleteOperation } from '../../operation/user/user-delete.operation';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

@ApiTags('User object')
@Controller('user')
export class UserController {

  relations = {
    group: true,
    child: true,
    contact: {contact: true},
    flag: {flag: true},
    point: {point: {directory: true}, attribute: true},
    string: {attribute: true, lang: true},
  } as FindOptionsRelations<UserEntity>;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {
  }

  toView(item: UserEntity) {
    return {
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      version: item.version,
      login: item.login,
      contact: item.contact.map(cn => ({
        contact: cn.contact.id,
        value: cn.value,
      })),
      group: item.group.map(gr => gr.id),
      attribute: [
        ...item.string.map(str => ({
          string: str.string,
          attribute: str.attribute.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          attribute: val.attribute.id,
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
    return this.userRepo.find({
      relations: this.relations,
      order: {created_at: 'asc'},
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount() {
    return this.userRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: string,
  ) {
    return this.userRepo.findOne({
      where: {id},
      relations: this.relations,
    }).then(this.toView);
  }

  @Post()
  async addUser(
    @Body()
      input: UserInput,
  ) {
    return this.entityManager.transaction(
      trans => new UserInsertOperation(this.entityManager).save(input)
        .then(id => trans.getRepository(UserEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Put(':id')
  @ApiParam({name: 'id', description: 'User id'})
  async updateUser(
    @Body()
      input: UserInput,
    @Param('id')
      id: string,
  ) {
    return this.entityManager.transaction(
      trans => new UserUpdateOperation(this.entityManager).save(id, input)
        .then(id => trans.getRepository(UserEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(this.toView);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id')
      id: string,
  ) {
    return this.entityManager.transaction(
      trans => new UserDeleteOperation(trans).save([id]),
    );
  }

}
