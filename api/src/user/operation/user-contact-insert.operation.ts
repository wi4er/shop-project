import { EntityManager } from "typeorm";
import { UserContactEntity } from "../model/user-contact.entity";
import { UserContact2stringEntity } from "../model/user-contact2string.entity";
import { UserContact2flagEntity } from "../model/user-contact2flag.entity";
import { StringValueInsertOperation } from "../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { UserContactInput } from "../input/user-contact.input";
import { filterProperties } from '../../common/input/filter-properties';

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

      const [stringList, pointList] = filterProperties(this.input.property);

      await new StringValueInsertOperation(trans, UserContact2stringEntity).save(this.created, stringList);
      await new FlagValueInsertOperation(trans, UserContact2flagEntity).save(this.created, this.input);
    });

    return contactRepo.findOne({
      where: { id: this.created.id },
      loadRelationIds: true,
    });
  }

}