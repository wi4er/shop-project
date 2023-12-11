import { Body, Controller, Get, Headers, HttpStatus, Post, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../model/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApiCreatedResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserUpdateOperation } from '../../operation/user-update.operation';
import { UserSchema } from '../../schema/user.schema';
import { UserInput } from '../../input/user.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { CurrentUser } from '../../decorator/current-user/current-user.decorator';
import { PermissionException } from '../../../exception/permission/permission.exception';

@Controller('myself')
export class MyselfController {

  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {
  }

  @Get()
  async getMyself(
    @CurrentUser()
      id: number | null,
  ) {
    PermissionException.assert(id, 'Authorization required!');

    const inst = await this.userRepo.findOne({
      where: {id},
      relations: {
        group: true,
      },
    });

    return inst;
  }

  @Post()
  async registerUser(
    @Headers('login')
      login: string,
    @Headers('password')
      password: string,
    @Req()
      req: Request,
    @Res()
      res: Response,
  ) {
    WrongDataException.assert(login, 'Login expected!');
    WrongDataException.assert(password, 'Password expected!');

    // return this.userService.createByLogin(login, password)
    //   .then(user => {
    //     this.sessionService.open(req, user);
    //     res.json(user);
    //   })
    //   .catch(err => {
    //     if (err.code === '23505') {
    //       res.status(400);
    //       return res.json({
    //         message: 'Login already exists!',
    //         field: 'login',
    //       });
    //     }
    //
    //     if (err['field']) {
    //       res.status(400);
    //       return res.json(err);
    //     }
    //
    //     res.status(500);
    //     return res.json(err);
    //   });
  }

  @Put()
  @ApiOperation({description: 'Update user by current session'})
  @ApiCreatedResponse({description: 'Current user updated successfully', type: UserSchema})
  @ApiUnauthorizedResponse({description: 'There is no current session'})
  async updateMyself(
    @Body()
      user: UserInput,
    @Req()
      req: Request,
    @Res()
      res: Response,
  ) {
    const id = req['session']?.['user']?.['id'];

    if (!id) {
      res.status(HttpStatus.UNAUTHORIZED);
      res.send(null);
    } else {
      res.status(201);
      res.send(await new UserUpdateOperation(this.entityManager).save(id, user));
    }
  }

}
