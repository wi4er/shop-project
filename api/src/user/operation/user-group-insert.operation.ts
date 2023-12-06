import { EntityManager } from "typeorm";
import { UserGroupEntity } from "../model/user-group.entity";
import { UserGroup2stringEntity } from "../model/user-group2string.entity";
import { UserGroup2flagEntity } from "../model/user-group2flag.entity";
import { StringValueInsertOperation } from "../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { UserGroupInput } from "../input/user-group.input";
import { filterProperties } from '../../common/input/filter-properties';

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

      const [stringList, pointList] = filterProperties(input.property);

      await new StringValueInsertOperation(trans, UserGroup2stringEntity).save(this.created, stringList);
      await new FlagValueInsertOperation(trans, UserGroup2flagEntity).save(this.created, input);
    });

    return groupRepo.findOne({
      where: { id: this.created.id },
      loadRelationIds: true,
    });
  }

}