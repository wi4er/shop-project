import { EntityManager } from "typeorm";
import { ContactEntity, UserContactType } from '../../model/contact/contact.entity';
import { Contact4stringEntity } from "../../model/contact/contact4string.entity";
import { Contact2flagEntity } from "../../model/contact/contact2flag.entity";
import { ContactInput } from "../../input/contact/contact.input";
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class ContactUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkContact(id: string) {
    const contactRepo = this.trans.getRepository(ContactEntity);

    return WrongDataException.assert(
      await contactRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `Contact with id ${id} not found!`
    );
  }

  /**
   *
   */
  async save(id: string, input: ContactInput): Promise<string> {
    const beforeItem = await this.checkContact(id);

    beforeItem.id = WrongDataException.assert(input.id, 'ContactEntity id expected');
    beforeItem.type = WrongDataException.assert(UserContactType[input.type], 'ContactEntity type expected!');

    await this.trans.save(beforeItem);

    await new FlagValueOperation(this.trans, beforeItem).save(Contact2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.trans, beforeItem).save(Contact4stringEntity, pack.string);

    return beforeItem.id;
  }

}