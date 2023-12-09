import { EntityManager } from "typeorm";
import { UserContactEntity } from "../model/user-contact.entity";
import { UserContact4stringEntity } from "../model/user-contact4string.entity";
import { UserContact2flagEntity } from "../model/user-contact2flag.entity";
import { StringValueInsertOperation } from "../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../common/operation/flag-value-insert.operation";
import { UserContactInput } from "../input/user-contact.input";
import { filterProperties } from '../../common/input/filter-properties';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserContactInsertOperation {

  created: UserContactEntity;

  protected manager: EntityManager;

  constructor(
    private trans: EntityManager,
  ) {
    this.created = new UserContactEntity();
  }

  async save(input: UserContactInput): Promise<string> {
    this.created.id = WrongDataException.assert(input.id, 'Contact id expected');
    this.created.type = WrongDataException.assert(input.type, 'Contact type expected!');

    await this.trans.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.trans, UserContact4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.trans, UserContact2flagEntity).save(this.created, input);

    return this.created.id;
  }

}