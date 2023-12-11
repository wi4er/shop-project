import { Body, Controller, Delete, Get, Headers, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionService } from '../../service/session/session.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../model/user.entity';
import { Repository } from 'typeorm';
import { EncodeService } from '../../service/encode/encode.service';
import { PermissionException } from '../../../exception/permission/permission.exception';

@ApiTags('User authorization')
@Controller('auth')
export class AuthController {

  constructor(
    private sessionService: SessionService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private encodeService: EncodeService,
  ) {
  }

  @Post()
  @ApiHeader({
    name: 'login',
    description: 'User login',
  })
  @ApiHeader({
    name: 'password',
    description: 'User password',
  })
  @ApiResponse({status: 403, description: 'User login or password incorrect!'})
  @ApiResponse({status: 200, description: 'Successfully authorized!'})
  async createSession(
    @Body()
      body: {
      login: string,
      password: string,
    },
    @Req()
      req: Request,
  ) {
    const user = await this.userRepo.findOne({
      where: {login: body.login},
      relations: {
        group: true,
      },
    });

    PermissionException.assert(user?.hash === this.encodeService.toSha256(body.password), 'Wrong user or password');
    this.sessionService.open(req, user);

    return {
      id: user.id,
      login: user.login,
      group: user.group.map(it => it.id),
    };
  }


  @Delete()
  @ApiResponse({status: 200, description: 'Session was successfully closed!'})
  @ApiResponse({status: 400, description: 'Session not found!'})
  async closeSession(
    @Req()
      req: Request,
    @Res()
      res: Response,
  ) {
    if (this.sessionService.close(req)) {
      res.status(200);
      res.json(true);
    } else {
      res.status(400);
      res.json(false);
    }
  }

}
