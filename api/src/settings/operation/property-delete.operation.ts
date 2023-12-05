import { EntityManager, In } from 'typeorm';
import { PropertyEntity } from '../model/property.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';

export class PropertyDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    const propRepo = this.manager.getRepository(PropertyEntity);

    const inst = await propRepo.findOne({where: {id}});
    NoDataException.assert(inst, `Property with id '${id}' not found!`);

    return inst;
  }

  /**
   *
   * @param idList
   */
  async save(idList: string[]) {
    const propRepo = this.manager.getRepository(PropertyEntity);

    const result = [];

    for (const id of idList) {
      const item = await this.checkProperty(id);
      await propRepo.delete(item.id);

      result.push(item.id);
    }

    return result;
  }

}