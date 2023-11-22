import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../model/user.entity';
import { Repository } from 'typeorm';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../service/user/user.service';
import { UserInput } from '../../input/user.input';

@ApiTags('User object')
@Controller('user')
export class UserController {

  relations = {
    string: {property: true, lang: true},
    group: true,
    child: true,
    contact: true,
    flag: {flag: true},
    point: {point: {directory: true}, property: true},
  };

  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private userService: UserService,
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
        contact: cn.contact,
        value: cn.value,
      })),
      group: item.group.map(gr => gr.id),
      property: [
        ...item.string.map(str => ({
          string: str.string,
          property: str.property.id,
          lang: str.lang?.id,
        })),
        ...item.point.map(val => ({
          property: val.property.id,
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
      take: limit,
      skip: offset,
    }).then(list => list.map(this.toView));
  }

  @Get('count')
  async getCount(
    @Query('offset')
      offset?: number,
    @Query('limit')
      limit?: number,
  ) {
    return this.userRepo.count().then(count => ({count}));
  }

  @Get(':id')
  async getItem(
    @Param('id')
      id: number,
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
    return this.userService.insert(input)
      .then(res => this.userRepo.findOne({
        where: {id: res.id},
        relations: this.relations,
      }))
      .then(this.toView);
  }

  @Put(':id')
  @ApiParam({name: 'id', description: 'User id'})
  async updateUser(
    @Body()
      user: UserInput,
    @Param('id')
      id: number,
  ) {
    console.log(id, user);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id')
      id: number,
  ) {
    return this.userService.deleteUser([id]);
  }

}
