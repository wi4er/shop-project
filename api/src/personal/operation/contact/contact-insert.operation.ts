import { EntityManager } from "typeorm";
import { ContactEntity } from "../../model/contact/contact.entity";
import { Contact4stringEntity } from "../../model/contact/contact4string.entity";
import { Contact2flagEntity } from "../../model/contact/contact2flag.entity";
import { ContactInput } from "../../input/contact/contact.input";
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class ContactInsertOperation {

  created: ContactEntity;

  protected manager: EntityManager;

  constructor(
    private trans: EntityManager,
  ) {
    this.created = new ContactEntity();
  }

  /**
   *
   */
  async save(input: ContactInput): Promise<string> {
    this.created.id = WrongDataException.assert(input.id, 'ContactEntity id expected');
    this.created.type = WrongDataException.assert(input.type, 'ContactEntity type expected!');

    await this.trans.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.detail);
      });

    await new FlagValueOperation(this.trans, Contact2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.trans, Contact4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}