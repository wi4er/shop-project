import { EntityManager } from "typeorm";
import { UserEntity } from "../model/user.entity";
import { User2stringEntity } from "../model/user2string.entity";
import { User2flagEntity } from "../model/user2flag.entity";
import { StringValueInsertOperation } from "../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { User2userContactInsertOperation } from "./user2user-contact-insert.operation";
import { User2userGroupInsertOperation } from "./user2user-group-insert.operation";
import { UserInput } from "../input/user.input";
import { filterProperties } from '../../common/input/filter-properties';

export class UserInsertOperation {

  created: UserEntity;
  constructor(
    private manager: EntityManager
  ) {
    this.created = new UserEntity();
  }

  async save(input: UserInput): Promise<UserEntity> {
    const userRepo = this.manager.getRepository(UserEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.created.login = input.login;

      await trans.save(this.created);

      const [stringList, pointList] = filterProperties(input.property);

      await new StringValueInsertOperation(trans, User2stringEntity).save(this.created, stringList);
      await new FlagValueInsertOperation(trans, User2flagEntity).save(this.created, input);
      await new User2userContactInsertOperation(trans).save(this.created, input);
      await new User2userGroupInsertOperation(trans).save(this.created, input);
    });

    return userRepo.findOne({
      where: { id: this.created.id },
      loadRelationIds: true,
    });
  }

}