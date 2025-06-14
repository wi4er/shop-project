import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../model/user/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserUpdateOperation } from '../../operation/user/user-update.operation';
import { UserInput } from '../../input/user/user.input';
import { CurrentUser } from '../../decorator/current-user/current-user.decorator';
import { PermissionException } from '../../../exception/permission/permission.exception';
import { MyselfView } from '../../view/myself.view';
import { EncodeService } from '../../service/encode/encode.service';
import { MyselfInsertOperation } from '../../operation/myself/myself-insert.operation';
import { AuthInput } from '../../input/auth/auth.input';

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

    return new MyselfView(inst);
  }

  @Post()
  async registerUser(
    @Body()
      input: AuthInput,
  ): Promise<MyselfView> {
    return this.entityManager.transaction(
      trans => new MyselfInsertOperation(this.entityManager, this.encodeService).save(input)
        .then(id => trans.getRepository(UserEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(user => {
      return new MyselfView(user);
    });
  }

  @Put()
  @ApiOperation({description: 'Update personal by current session'})
  @ApiUnauthorizedResponse({description: 'There is no current session'})
  async updateMyself(
    @CurrentUser()
      id: string | null,
    @Body()
      user: UserInput,
  ): Promise<MyselfView> {
    PermissionException.assert(id, 'Authorization required!');

    return this.entityManager.transaction(
      trans => new UserUpdateOperation(trans).save(id, user)
        .then(id => trans.getRepository(UserEntity).findOne({
          where: {id},
          relations: this.relations,
        })),
    ).then(user => {
      return new MyselfView(user);
    });
  }

}
