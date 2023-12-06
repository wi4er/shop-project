import { EntityManager } from "typeorm";
import { UserGroupEntity } from "../model/user-group.entity";
import { UserGroup2stringEntity } from "../model/user-group2string.entity";
import { UserGroup2flagEntity } from "../model/user-group2flag.entity";
import { StringValueUpdateOperation } from "../../common/operation/string-value-update.operation";
import { FlagValueUpdateOperation } from "../../common/operation/flag-value-update.operation";
import { UserGroupInput } from "../input/user-group.input";
import { filterProperties } from '../../common/input/filter-properties';

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

      const [stringList, pointList] = filterProperties(this.input.property);

      await new StringValueUpdateOperation(trans, UserGroup2stringEntity).save(this.beforeItem, stringList);
      await new FlagValueUpdateOperation(trans, UserGroup2flagEntity).save(this.beforeItem, this.input);

      await this.beforeItem.save();
    });

    return langRepo.findOne({
      where: { id: this.input.id },
      loadRelationIds: true,
    });
  }

}