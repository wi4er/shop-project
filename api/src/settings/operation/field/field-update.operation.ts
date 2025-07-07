import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { FieldEntity } from '../../model/field/field.entity';
import { Field2flagEntity } from '../../model/field/field2flag.entity';
import { Field4stringEntity } from '../../model/field/field4string.entity';
import { FieldInput } from '../../input/field/field.input';

export class FieldUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkField(id: string): Promise<FieldEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(FieldEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
            flag: {flag: true},
          },
        }),
      `Field with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: FieldInput): Promise<string> {
    try {
      await this.manager.update(FieldEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Field id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkField(input.id);

    await new FlagValueOperation(this.manager, Field2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Field4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}