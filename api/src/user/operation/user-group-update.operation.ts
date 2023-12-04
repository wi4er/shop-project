import { EntityManager } from "typeorm";
import { UserGroupEntity } from "../model/user-group.entity";
import { UserGroup2stringEntity } from "../model/user-group2string.entity";
import { UserGroup2flagEntity } from "../model/user-group2flag.entity";
import { PropertyValueUpdateOperation } from "../../common/operation/property-value-update.operation";
import { FlagValueUpdateOperation } from "../../common/operation/flag-value-update.operation";
import { UserGroupInput } from "../input/user-group.input";

export class UserGroupUpdateOperation {

  beforeItem: UserGroupEntity;

  manager: EntityManager;

  constructor(
    protected input: UserGroupInput,
  ) {

  }

  async save(manager: EntityManager): Promise<UserGroupEntity> {
    this.manager = manager;
    const langRepo = this.manager.getRepository(UserGroupEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.beforeItem = await langRepo.findOne({
        where: { id: this.input.id },
        relations: {
          string: { property: true },
          flag: {flag: true},
        },
      });

      await new PropertyValueUpdateOperation(trans, UserGroup2stringEntity).save(this.beforeItem, this.input);
      await new FlagValueUpdateOperation(trans, UserGroup2flagEntity).save(this.beforeItem, this.input);

      await this.beforeItem.save();
    });

    return langRepo.findOne({
      where: { id: this.input.id },
      loadRelationIds: true,
    });
  }

}