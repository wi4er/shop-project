import { EntityManager } from 'typeorm';
import { UserEntity } from '../model/user.entity';
import { UserContactEntity } from '../model/user-contact.entity';
import { User2userContactEntity } from '../model/user2user-contact.entity';
import { UserInput } from '../input/user.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

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
  private async checkContact(id: string): Promise<UserContactEntity> {
    const contactRepo = this.trans.getRepository<UserContactEntity>(UserContactEntity);
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
      const inst = new User2userContactEntity();
      inst.parent = created;
      inst.contact = await this.checkContact(item.contact);
      inst.value = item.value;
      inst.verify = false;
      inst.verifyCode = 'qwerty';

      await this.trans.save(inst);
    }
  }

}