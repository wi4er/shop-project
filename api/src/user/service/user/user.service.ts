import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../model/user.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { EncodeService } from '../encode/encode.service';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { StringValueUpdateOperation } from '../../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { UserInput } from '../../input/user.input';
import { User2stringEntity } from '../../model/user2string.entity';
import { User2flagEntity } from '../../model/user2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { filterProperties } from '../../../common/input/filter-properties';

@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager()
    private manager: EntityManager,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private encodeService: EncodeService,
  ) {

  }

  /**
   *
   */
  async findByLogin(login: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepo.findOne({where: {login}});

    if (
      !user
      || user.hash !== this.encodeService.toSha256(password)
    ) return null;

    return user;
  }

  async findByContact(
    contact: string,
    value: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userRepo.findOne({
      relations: {contact: {contact: true}},
      where: {contact: {contact: {id: contact}}},
    });

    if (
      !user
      || user.hash !== this.encodeService.toSha256(password)
    ) return null;

    return user;
  }

  /**
   *
   */
  async createByLogin(login: string, password: string): Promise<UserEntity> {

    if (password.length < 8) {
      const err = new Error();
      err['message'] = 'Password length at least 8 characters required!';
      err['field'] = 'password';

      throw err;
    }

    const user = new UserEntity();

    user.login = login;
    user.hash = this.encodeService.toSha256(password);
    await user.save();

    return user;
  }

  async insert(input: UserInput): Promise<UserEntity> {
    const created = new UserEntity();

    await this.manager.transaction(async (trans: EntityManager) => {
      created.id = input.id;
      created.login = input.login;
      await trans.save(created);

      const [stringList, pointList] = filterProperties(input.property);

      await new StringValueInsertOperation(trans, User2stringEntity).save(created, stringList);
      await new FlagValueInsertOperation(trans, User2flagEntity).save(created, input);
    }).catch(err => {
      WrongDataException.assert(err.column !== 'login', 'Login expected!');
    });

    return this.userRepo.findOne({
      where: {id: created.id},
      loadRelationIds: true,
    });
  }

  async update(input: UserInput): Promise<UserEntity> {
    await this.manager.transaction(async (trans: EntityManager) => {
      const beforeItem = await this.userRepo.findOne({
        where: {id: input.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
        },
      });
      beforeItem.login = input.login;
      await beforeItem.save();

      const [stringList, pointList] = filterProperties(input.property);
      await new StringValueUpdateOperation(trans, User2stringEntity).save(beforeItem, stringList);
      await new FlagValueUpdateOperation(trans, User2flagEntity).save(beforeItem, input);
    });

    return this.userRepo.findOne({
      where: {id: input.id},
      loadRelationIds: true,
    });
  }

  /**
   *
   */
  async deleteUser(id: number[]): Promise<number[]> {
    const result = [];
    const list = await this.userRepo.find({where: {id: In(id)}});

    for (const item of list) {
      await this.userRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}
