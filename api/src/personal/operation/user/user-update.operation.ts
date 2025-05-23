import { UserEntity } from '../../model/user/user.entity';
import { EntityManager } from 'typeorm';
import { User4stringEntity } from '../../model/user/user4string.entity';
import { StringValueUpdateOperation } from '../../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { User2flagEntity } from '../../model/user/user2flag.entity';
import { User2userContactUpdateOperation } from './user2user-contact-update.operation';
import { UserInput } from '../../input/user.input';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class UserUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkUser(id: string): Promise<UserEntity> {
    const userRepo = this.trans.getRepository<UserEntity>(UserEntity);

    return WrongDataException.assert(
      await userRepo.findOne({
        where: {id},
        relations: {
          contact: {contact: true},
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `User with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: UserInput): Promise<string> {
    const beforeItem = await this.checkUser(id);

    beforeItem.login = WrongDataException.assert(input.login, 'UserEntity login expected');
    await this.trans.save(beforeItem);

    await new FlagValueUpdateOperation(this.trans, User2flagEntity).save(beforeItem, input);
    await new User2userContactUpdateOperation(this.trans).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.trans, User4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}