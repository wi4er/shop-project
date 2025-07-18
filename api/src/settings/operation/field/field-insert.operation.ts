import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { FieldEntity } from '../../model/field/field.entity';
import { FieldInput } from '../../input/field/field.input';
import { Field2flagEntity } from '../../model/field/field2flag.entity';
import { Field4stringEntity } from '../../model/field/field4string.entity';

export class FieldInsertOperation {

  created: FieldEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FieldEntity();
  }

  /**
   *
   */
  async save(input: FieldInput): Promise<string> {
    this.created.id = input.id;

    try {
      await this.manager.insert(FieldEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new FlagValueOperation(this.manager, this.created).save(Field2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, this.created).save(Field4stringEntity, pack.string);

    return this.created.id;
  }

}