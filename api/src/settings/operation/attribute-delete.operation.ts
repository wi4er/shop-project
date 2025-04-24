import { EntityManager, In } from 'typeorm';
import { AttributeEntity } from '../model/attribute.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';

export class AttributeDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkProperty(id: string): Promise<AttributeEntity> {
    const propRepo = this.manager.getRepository(AttributeEntity);

    return NoDataException.assert(
      await propRepo.findOne({where: {id}}),
      `Attribute with id >> '${id}' << not found!`
    );
  }

  /**
   *
   */
  async save(idList: string[]) {
    const propRepo = this.manager.getRepository(AttributeEntity);

    const result = [];

    for (const id of idList) {
      const item = await this.checkProperty(id);
      await propRepo.delete(item.id);

      result.push(item.id);
    }

    return result;
  }

}