import { EntityManager } from "typeorm";
import { UserContactEntity } from "../model/user-contact.entity";
import { UserContact2stringEntity } from "../model/user-contact2string.entity";
import { UserContact2flagEntity } from "../model/user-contact2flag.entity";
import { PropertyValueInsertOperation } from "../../common/operation/property-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { UserContactInput } from "../input/user-contact.input";

export class UserContactInsertOperation {

  created: UserContactEntity;

  protected manager: EntityManager;

  constructor(
    protected input: UserContactInput
  ) {
    this.created = new UserContactEntity();
    this.created.id = this.input.id;
    this.created.type = this.input.type;
  }

  async save(manager: EntityManager): Promise<UserContactEntity> {
    this.manager = manager;
    const contactRepo = this.manager.getRepository(UserContactEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      await trans.save(this.created);

      await new PropertyValueInsertOperation(trans, UserContact2stringEntity).save(this.created, this.input);
      await new FlagValueInsertOperation(trans, UserContact2flagEntity).save(this.created, this.input);
    });

    return contactRepo.findOne({
      where: { id: this.created.id },
      loadRelationIds: true,
    });
  }

}