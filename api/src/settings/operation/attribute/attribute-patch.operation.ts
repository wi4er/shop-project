import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../model/attribute.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { AttributeInput } from '../../input/attribute.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Attribute2flagEntity } from '../../model/attribute2flag.entity';

export class AttributePatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    const propRepo = this.manager.getRepository(AttributeEntity);

    return NoDataException.assert(
      await propRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `Attribute with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: AttributeInput): Promise<string> {
    const beforeItem = await this.checkAttribute(id);

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Attribute2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}