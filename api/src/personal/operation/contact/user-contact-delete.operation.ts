import { EntityManager } from 'typeorm';
import { ContactEntity } from '../../model/contact.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';

export class UserContactDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  /**
   *
   * @param id
   * @private
   */
  private async checkContact(id: string): Promise<ContactEntity> {
    const contactRepo = this.manager.getRepository<ContactEntity>(ContactEntity);
    const inst = await contactRepo.findOne({where: {id}});

    return NoDataException.assert(inst, `Contact id ${id} not found!`);
  }

  /**
   *
   * @param idList
   */
  async save(idList: string[]) {
    const contactRepo = this.manager.getRepository(ContactEntity);

    const result = [];

    for (const item of idList) {
      await this.checkContact(item)
      await contactRepo.delete(item);
      result.push(item);
    }

    return result;
  }

}