import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { StringValueInsertOperation } from '../../../common/operation/string/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag/flag-value-insert.operation';
import { AttributeEntity, AttributeType } from '../../model/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeInput } from '../../input/attribute.input';
import { AttributeAsPointInsertOperation } from './attribute-as-point-insert.operation';
import { AttributeAsElementInsertOperation } from './attribute-as-element-insert.operation';
import { AttributeAsSectionInsertOperation } from './attribute-as-section-insert.operation';
import { AttributeAsFileInsertOperation } from './attribute-as-file-insert.operation';

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

    await new FlagValueInsertOperation(this.manager, Attribute2flagEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Attribute4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}