import { EntityManager } from 'typeorm';
import { UserEntity } from '../../model/user/user.entity';
import { ContactEntity } from '../../model/contact/contact.entity';
import { User2contactEntity } from '../../model/user/user2contact.entity';
import { UserInput } from '../../input/user.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class User2userContactInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkContact(id: string): Promise<ContactEntity> {
    const contactRepo = this.trans.getRepository<ContactEntity>(ContactEntity);
    const inst = await contactRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, 'Wrong contact id!');
  }

  /**
   *
   * @param created
   * @param input
   */
  async save(created: UserEntity, input: UserInput) {
    for (const item of input.contact ?? []) {
      const inst = new User2contactEntity();
      inst.parent = created;
      inst.contact = await this.checkContact(item.contact);
      inst.value = item.value;
      inst.verify = false;
      inst.verifyCode = 'qwerty';

      await this.trans.save(inst);
    }
  }

}