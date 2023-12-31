import { EntityManager } from "typeorm";
import { UserEntity } from "../model/user.entity";
import { User2contactEntity } from "../model/user2contact.entity";
import { ContactEntity } from "../model/contact.entity";
import { UserInput } from "../input/user.input";

export class User2userContactUpdateOperation {
  constructor(
    private trans: EntityManager,
  ) {
  }

  async save(beforeItem: UserEntity, input: UserInput) {
    const contactRepo = this.trans.getRepository(ContactEntity);
    const current: { [key: string]: User2contactEntity } = {};

    for (const item of beforeItem.contact) {
      current[item.contact.id] = item;
    }

    for (const item of input.contact ?? []) {
      let inst: User2contactEntity;

      if (current[item.contact]) {
        inst = current[item.contact];
        delete current[item.contact];
      } else {
        inst = new User2contactEntity();
        inst.verify = false;
        inst.verifyCode = '123123'
      }

      inst.parent = beforeItem;
      inst.contact = await contactRepo.findOne({ where: { id: item.contact } });
      inst.value = item.value;

      await this.trans.save(inst);
    }

    for (const contact of Object.values(current)) {
      await this.trans.delete(User2contactEntity, contact.id);
    }
  }
}