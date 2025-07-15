import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { Attribute2flagEntity } from '../../model/attribute/attribute2flag.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';

export class AttributePatchOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(AttributeEntity)
        .findOne({
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

    if (input.id) await this.transaction.update(AttributeEntity, {id}, {id: input.id});
    if (input.flag) await new FlagValueOperation(this.transaction, beforeItem).save(Attribute2flagEntity, input.flag);

    return input.id ? input.id : beforeItem.id;
  }

}