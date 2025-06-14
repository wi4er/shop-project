import { UserEntity } from '../../model/user/user.entity';
import { EntityManager } from 'typeorm';
import { User4stringEntity } from '../../model/user/user4string.entity';
import { User2flagEntity } from '../../model/user/user2flag.entity';
import { User2userContactUpdateOperation } from './user2user-contact-update.operation';
import { UserInput } from '../../input/user/user.input';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class UserUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkUser(id: string): Promise<UserEntity> {
    return WrongDataException.assert(
      await this.trans
        .getRepository<UserEntity>(UserEntity)
        .findOne({
          where: {id},
          relations: {
            group: {group: true},
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

    await new FlagValueOperation(this.trans, User2flagEntity).save(beforeItem, input.flag);
    await new User2userContactUpdateOperation(this.trans).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.trans, User4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}