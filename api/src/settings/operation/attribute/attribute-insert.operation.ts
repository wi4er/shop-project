import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { AttributeEntity, AttributeType } from '../../model/attribute/attribute.entity';
import { Attribute4stringEntity } from '../../model/attribute/attribute4string.entity';
import { Attribute2flagEntity } from '../../model/attribute/attribute2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { AttributeAsPointOperation } from './attribute-as-point.operation';
import { AttributeAsElementOperation } from './attribute-as-element.operation';
import { AttributeAsSectionOperation } from './attribute-as-section.operation';
import { AttributeAsFileOperation } from './attribute-as-file.operation';

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
        await new AttributeAsPointOperation(this.manager).save(this.created, input);
        break;

      case AttributeType.ELEMENT:
        await new AttributeAsElementOperation(this.manager).save(this.created, input);
        break;

      case AttributeType.SECTION:
        await new AttributeAsSectionOperation(this.manager).save(this.created, input);
        break;

      case AttributeType.FILE:
        await new AttributeAsFileOperation(this.manager).save(this.created, input);
        break;
    }
    await new FlagValueOperation(this.manager, this.created).save(Attribute2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, this.created).save(Attribute4stringEntity, pack.string);

    return this.created.id;
  }

}