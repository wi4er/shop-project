import { EntityManager } from "typeorm";
import { ContactEntity } from "../model/contact.entity";
import { Contact4stringEntity } from "../model/contact4string.entity";
import { Contact2flagEntity } from "../model/contact2flag.entity";
import { StringValueUpdateOperation } from "../../common/operation/string-value-update.operation";
import { FlagValueUpdateOperation } from "../../common/operation/flag-value-update.operation";
import { UserContactInput } from "../input/user-contact.input";
import { filterAttributes } from '../../common/input/filter-attributes';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserContactUpdateOperation {

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
  async save(id: string, input: UserContactInput): Promise<string> {
    const beforeItem = await this.checkContact(input.id);

    beforeItem.id = WrongDataException.assert(input.id, 'Contact id expected');
    beforeItem.type = WrongDataException.assert(input.type, 'Contact type expected!');

    await this.trans.save(beforeItem);

    const [stringList, pointList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.trans, Contact4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.trans, Contact2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}