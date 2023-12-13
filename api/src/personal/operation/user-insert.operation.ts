import { EntityManager } from "typeorm";
import { UserEntity } from "../model/user.entity";
import { User4stringEntity } from "../model/user4string.entity";
import { User2flagEntity } from "../model/user2flag.entity";
import { StringValueInsertOperation } from "../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { User2userContactInsertOperation } from "./user2user-contact-insert.operation";
import { User2userGroupInsertOperation } from "./user2user-group-insert.operation";
import { UserInput } from "../input/user.input";
import { filterProperties } from '../../common/input/filter-properties';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserInsertOperation {

  created: UserEntity;

  constructor(
    private manager: EntityManager
  ) {
    this.created = new UserEntity();
  }

  async save(input: UserInput): Promise<number> {
    this.created.login = WrongDataException.assert(input.login, 'User login expected!');

    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, User4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, User2flagEntity).save(this.created, input);
    await new User2userContactInsertOperation(this.manager).save(this.created, input);
    await new User2userGroupInsertOperation(this.manager).save(this.created, input);

    return this.created.id;
  }

}