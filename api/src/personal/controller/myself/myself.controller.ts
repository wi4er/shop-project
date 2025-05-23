import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../model/user/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApiCreatedResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserUpdateOperation } from '../../operation/user/user-update.operation';
import { UserSchema } from '../../schema/user.schema';
import { UserInput } from '../../input/user.input';
import { CurrentUser } from '../../decorator/current-user/current-user.decorator';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { MyselfRender } from '../../render/myself.render';
import { EncodeService } from '../../service/encode/encode.service';
import { MyselfInsertOperation } from '../../operation/myself-insert.operation';
import { AuthInput } from '../../input/auth.input';

@Controller('personal/myself')
export class MyselfController {

  relations = {
    group: {group: true},
  };

  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectEntityManager()
    private entityManager: EntityManager,
    private encodeService: EncodeService,
  ) {
  }

  @Get()
  async getMyself(
    @CurrentUser()
      id: string | null,
  ) {
    PermissionException.assert(id, 'Authorization required!');

    const inst = await this.userRepo.findOne({
      where: {id},
      relations: this.relations,
    });

    return new MyselfRender(inst);
  }

  @Post()
  async registerUser(
    @Body()
      input: AuthInput,
  ): Promise<MyselfRender> {
    return this.entityManager.transaction(
      trans => new MyselfInsertOperation(this.entityManager, this.encodeService).save(input)
        .then(id => trans.getRepository(UserEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(user => {
      return new MyselfRender(user);
    });
  }

  @Put()
  @ApiOperation({description: 'Update personal by current session'})
  @ApiCreatedResponse({description: 'Current personal updated successfully', type: UserSchema})
  @ApiUnauthorizedResponse({description: 'There is no current session'})
  async updateMyself(
    @CurrentUser()
      id: string | null,
    @Body()
      user: UserInput,
  ): Promise<MyselfRender> {
    PermissionException.assert(id, 'Authorization required!');

    return this.entityManager.transaction(
      trans => new UserUpdateOperation(trans).save(id, user)
        .then(id => trans.getRepository(UserEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(user => {
      return new MyselfRender(user);
    });
  }

}
