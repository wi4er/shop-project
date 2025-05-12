import { EntityManager } from "typeorm";
import { UserEntity } from "../../model/user/user.entity";
import { User2groupEntity } from "../../model/user/user2group.entity";
import { GroupEntity } from "../../model/group/group.entity";
import { UserInput } from "../../input/user.input";

export class User2userGroupInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  async save(created: UserEntity, input: UserInput) {
    const repo = this.trans.getRepository(GroupEntity);

    for (const id of input.group ?? []) {
      const inst = new User2groupEntity();
      inst.parent = created;
      inst.group = await repo.findOne({ where: { id } });

      await this.trans.save(inst);
    }
  }

}