import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../model/user.entity";
import { EntityManager, Repository } from "typeorm";
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { UserService } from "../../service/user/user.service";
import { UserInput } from "../../input/user.input";

@ApiTags('User object')
@Controller('user')
export class UserController {

  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectEntityManager()
    private entityManager: EntityManager,
    private userService: UserService
  ) {
  }

  @Get()
  async list() {
    return this.userRepo.find()
  }

  @Post()
  async addUser(
    @Body()
      user: UserInput,
  ) {

    console.log(user)

  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'User id' })
  async updateUser(
    @Body()
      user: UserInput,
    @Param('id')
      id: number
  ) {

    console.log(id, user)

  }

  @Get(":id")
  async item(
    @Param('id')
      id: number
  ) {
    return this.userRepo.findOne({ where: { id } });
  }

  @Delete(':id')
  async deleteUser(
    @Param('id')
      id: number
  ) {
    return this.userService.deleteUser([ id ]);
  }

}
