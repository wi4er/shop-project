import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { AttributeEntity } from '../model/attribute.entity';
import { Attribute4stringEntity } from '../model/attribute4string.entity';
import { Attribute2flagEntity } from '../model/attribute2flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { AttributeInput } from '../input/attribute.input';

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

    try {
      await this.manager.insert(AttributeEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new FlagValueInsertOperation(this.manager, Attribute2flagEntity).save(this.created, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Attribute4stringEntity).save(this.created, stringList);

    return this.created.id;
  }

}