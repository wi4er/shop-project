import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { AttributeEntity, AttributeType } from '../../model/attribute/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute/attribute2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeAsPointOperation } from './attribute-as-point.operation';
import { AttributeAsElementOperation } from './attribute-as-element.operation';
import { AttributeAsSectionOperation } from './attribute-as-section.operation';
import { AttributeAsFileOperation } from './attribute-as-file.operation';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class AttributeUpdateOperation {

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
    try {
      await this.transaction.update(AttributeEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Attribute id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkAttribute(input.id);

    WrongDataException.assert(input.type === beforeItem.type, 'Attribute type is immutable!');

    switch (AttributeType[input.type]) {
      case AttributeType.POINT:
        await new AttributeAsPointOperation(this.transaction).save(beforeItem, input);
        break;
      case AttributeType.ELEMENT:
        await new AttributeAsElementOperation(this.transaction).save(beforeItem, input);
        break;
      case AttributeType.SECTION:
        await new AttributeAsSectionOperation(this.transaction).save(beforeItem, input);
        break;
      case AttributeType.FILE:
        await new AttributeAsFileOperation(this.transaction).save(beforeItem, input);
        break;
    }

    await new FlagValueOperation(this.transaction, beforeItem).save(Attribute2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, beforeItem).save(Attribute4stringEntity, pack.string);

    return beforeItem.id;
  }

}