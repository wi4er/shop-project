import { EntityManager } from "typeorm";
import { UserEntity } from "../model/user.entity";
import { User2userGroupEntity } from "../model/user2user-group.entity";
import { UserGroupEntity } from "../model/user-group.entity";
import { UserInput } from "../input/user.input";

export class User2userGroupInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  async save(created: UserEntity, input: UserInput) {
    const repo = this.trans.getRepository(UserGroupEntity);

    for (const id of input.group ?? []) {
      const inst = new User2userGroupEntity();
      inst.parent = created;
      inst.group = await repo.findOne({ where: { id } });

      await this.trans.save(inst);
    }
  }

}