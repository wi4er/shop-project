import { EntityManager } from "typeorm";
import { UserContactEntity } from "../model/user-contact.entity";
import { UserContact2stringEntity } from "../model/user-contact2string.entity";
import { UserContact2flagEntity } from "../model/user-contact2flag.entity";
import { StringValueUpdateOperation } from "../../common/operation/string-value-update.operation";
import { FlagValueUpdateOperation } from "../../common/operation/flag-value-update.operation";
import { UserContactInput } from "../input/user-contact.input";

export class UserContactUpdateOperation {

  beforeItem: UserContactEntity;

  manager: EntityManager;

  constructor(
    protected input: UserContactInput,
  ) {

  }

  async save(manager: EntityManager): Promise<UserContactEntity> {
    this.manager = manager;
    const langRepo = this.manager.getRepository(UserContactEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.beforeItem = await langRepo.findOne({
        where: { id: this.input.id },
        relations: {
          string: { property: true },
          flag: {flag: true},
        },
      });

      this.beforeItem.type = this.input.type;
      await new StringValueUpdateOperation(trans, UserContact2stringEntity).save(this.beforeItem, this.input);
      await new FlagValueUpdateOperation(trans, UserContact2flagEntity).save(this.beforeItem, this.input);

      await this.beforeItem.save();
    });

    return langRepo.findOne({
      where: { id: this.input.id },
      loadRelationIds: true,
    });
  }

}