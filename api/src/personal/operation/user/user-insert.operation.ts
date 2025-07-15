import { EntityManager } from "typeorm";
import { UserEntity } from "../../model/user/user.entity";
import { User4stringEntity } from "../../model/user/user4string.entity";
import { User2flagEntity } from "../../model/user/user2flag.entity";
import { User2userContactInsertOperation } from "./user2user-contact-insert.operation";
import { User2userGroupInsertOperation } from "./user2user-group-insert.operation";
import { UserInput } from "../../input/user/user.input";
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class UserInsertOperation {

  created: UserEntity;

  constructor(
    private manager: EntityManager
  ) {
    this.created = new UserEntity();
  }

  async save(input: UserInput): Promise<string> {
    this.created.login = WrongDataException.assert(input.login, 'UserEntity login expected!');

    await this.manager.save(this.created);

    await new FlagValueOperation(this.manager, this.created).save(User2flagEntity, input.flag);
    await new User2userContactInsertOperation(this.manager).save(this.created, input);
    await new User2userGroupInsertOperation(this.manager).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, User4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}