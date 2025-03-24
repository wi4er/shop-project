import { UserEntity } from '../model/user.entity';
import { EntityManager } from 'typeorm';
import { User4stringEntity } from '../model/user4string.entity';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { User2flagEntity } from '../model/user2flag.entity';
import { User2userContactUpdateOperation } from './user2user-contact-update.operation';
import { UserInput } from '../input/user.input';
import { filterProperties } from '../../common/input/filter-properties';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkUser(id: number): Promise<UserEntity> {
    const userRepo = this.trans.getRepository<UserEntity>(UserEntity);

    return WrongDataException.assert(
      await userRepo.findOne({
        where: {id},
        relations: {
          contact: {contact: true},
          string: {property: true},
          flag: {flag: true},
        },
      }),
      `User with id >> ${id} << not found!`,
    );
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: number, input: UserInput): Promise<number> {
    const beforeItem = await this.checkUser(id);

    beforeItem.login = WrongDataException.assert(input.login, 'User login expected');
    await this.trans.save(beforeItem);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueUpdateOperation(this.trans, User4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.trans, User2flagEntity).save(beforeItem, input);
    await new User2userContactUpdateOperation(this.trans).save(beforeItem, input);

    return beforeItem.id;
  }

}