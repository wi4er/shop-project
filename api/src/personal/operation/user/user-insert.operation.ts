import { EntityManager } from "typeorm";
import { UserEntity } from "../../model/user/user.entity";
import { User4stringEntity } from "../../model/user/user4string.entity";
import { User2flagEntity } from "../../model/user/user2flag.entity";
import { StringValueInsertOperation } from "../../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../../common/operation/flag-value-insert.operation";
import { User2userContactInsertOperation } from "./user2user-contact-insert.operation";
import { User2userGroupInsertOperation } from "./user2user-group-insert.operation";
import { UserInput } from "../../input/user.input";
import { filterAttributes } from '../../../common/input/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

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

    await new FlagValueInsertOperation(this.manager, User2flagEntity).save(this.created, input);
    await new User2userContactInsertOperation(this.manager).save(this.created, input);
    await new User2userGroupInsertOperation(this.manager).save(this.created, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, User4stringEntity).save(this.created, stringList);

    return this.created.id;
  }

}