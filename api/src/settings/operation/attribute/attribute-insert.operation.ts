import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { AttributeEntity, AttributeType } from '../../model/attribute/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute/attribute2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { AttributeAsPointInsertOperation } from './attribute-as-point-insert.operation';
import { AttributeAsElementInsertOperation } from './attribute-as-element-insert.operation';
import { AttributeAsSectionInsertOperation } from './attribute-as-section-insert.operation';
import { AttributeAsFileInsertOperation } from './attribute-as-file-insert.operation';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class AttributeInsertOperation {

  created: AttributeEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new AttributeEntity();
  }

  /**
   *
   */
  async save(input: AttributeInput): Promise<string> {
    this.created.id = input.id;
    this.created.type = WrongDataException.assert(
      AttributeType[input.type ?? AttributeType.STRING],
      `Wrong attribute type >> ${input.type} <<, expected [${Object.keys(AttributeType).join(', ')}]`,
    );

    try {
      await this.manager.insert(AttributeEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    switch (AttributeType[input.type]) {
      case AttributeType.POINT:
        await new AttributeAsPointInsertOperation(this.manager).save(this.created, input.directory);
        break;

      case AttributeType.ELEMENT:
        await new AttributeAsElementInsertOperation(this.manager).save(this.created, input.block);
        break;

      case AttributeType.SECTION:
        await new AttributeAsSectionInsertOperation(this.manager).save(this.created, input.block);
        break;

      case AttributeType.FILE:
        await new AttributeAsFileInsertOperation(this.manager).save(this.created, input.collection);
        break;
    }
    await new FlagValueOperation(this.manager, Attribute2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Attribute4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}