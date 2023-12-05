import { UserEntity } from "../model/user.entity";
import { EntityManager } from "typeorm";
import { User2stringEntity } from "../model/user2string.entity";
import { StringValueUpdateOperation } from "../../common/operation/string-value-update.operation";
import { FlagValueUpdateOperation } from "../../common/operation/flag-value-update.operation";
import { User2flagEntity } from "../model/user2flag.entity";
import { User2userContactUpdateOperation } from "./user2user-contact-update.operation";
import { UserInput } from "../input/user.input";
import { filterProperties } from '../../common/input/filter-properties';

export class UserUpdateOperation {

  beforeItem: UserEntity;

  constructor(
    private manager: EntityManager
  ) {
  }

  async save(input: UserInput): Promise<UserEntity> {
    const userRepo = this.manager.getRepository(UserEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.beforeItem = await userRepo.findOne({
        where: { id: input.id },
        relations: {
          string: { property: true },
          flag: { flag: true },
          contact: { contact: true },
        },
      });

      this.beforeItem.login = input.login;
      await this.beforeItem.save();

      const [stringList, pointList] = filterProperties(input.property);

      await new StringValueUpdateOperation(trans, User2stringEntity).save(this.beforeItem, stringList);
      await new FlagValueUpdateOperation(trans, User2flagEntity).save(this.beforeItem, input);
      await new User2userContactUpdateOperation(trans).save(this.beforeItem, input);
    });

    return userRepo.findOne({
      where: { id: input.id },
      loadRelationIds: true,
    });
  }

}