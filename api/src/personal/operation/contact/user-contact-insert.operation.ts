import { EntityManager } from "typeorm";
import { ContactEntity } from "../../model/contact/contact.entity";
import { Contact4stringEntity } from "../../model/contact/contact4string.entity";
import { Contact2flagEntity } from "../../model/contact/contact2flag.entity";
import { StringValueInsertOperation } from "../../../common/operation/string-value-insert.operation";
import { FlagValueInsertOperation } from "../../../common/operation/flag-value-insert.operation";
import { ContactInput } from "../../input/contact.input";
import { filterAttributes } from '../../../common/input/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class UserContactInsertOperation {

  created: ContactEntity;

  protected manager: EntityManager;

  constructor(
    private trans: EntityManager,
  ) {
    this.created = new ContactEntity();
  }

  async save(input: ContactInput): Promise<string> {
    this.created.id = WrongDataException.assert(input.id, 'ContactEntity id expected');
    this.created.type = WrongDataException.assert(input.type, 'ContactEntity type expected!');

    await this.trans.save(this.created);

    await new FlagValueInsertOperation(this.trans, Contact2flagEntity).save(this.created, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.trans, Contact4stringEntity).save(this.created, stringList);

    return this.created.id;
  }

}