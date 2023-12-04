import { EntityManager } from "typeorm";
import { UserGroupEntity } from "../model/user-group.entity";
import { UserGroup2stringEntity } from "../model/user-group2string.entity";
import { UserGroup2flagEntity } from "../model/user-group2flag.entity";
import { PropertyValueInsertOperation } from "../../common/operation/property-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { UserGroupInput } from "../input/user-group.input";

export class UserGroupInsertOperation {

  created: UserGroupEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new UserGroupEntity();
  }

  async save(input: UserGroupInput): Promise<UserGroupEntity> {
    const groupRepo = this.manager.getRepository(UserGroupEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.created.parent = await groupRepo.findOne({ where: { id: input.parent } });
      this.created.id = input.id;

      await trans.save(this.created);

      await new PropertyValueInsertOperation(trans, UserGroup2stringEntity).save(this.created, input);
      await new FlagValueInsertOperation(trans, UserGroup2flagEntity).save(this.created, input);
    });

    return groupRepo.findOne({
      where: { id: this.created.id },
      loadRelationIds: true,
    });
  }

}