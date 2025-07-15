import { EntityManager } from 'typeorm';
import { FlagEntity } from '../../model/flag/flag.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { FieldEntity } from '../../model/field/field.entity';
import { Field2flagEntity } from '../../model/field/field2flag.entity';
import { Field4stringEntity } from '../../model/field/field4string.entity';
import { FieldInput } from '../../input/field/field.input';

export class FieldPatchOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkField(id: string): Promise<FieldEntity> {
    return NoDataException.assert(
      await this.transaction
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
    if (input.id) await this.transaction.update(FlagEntity, {id}, {id: input.id});

    const beforeItem = await this.checkField(input.id ? input.id : id);

    if (input.flag) await new FlagValueOperation(this.transaction, beforeItem).save(Field2flagEntity, input.flag);
    if (input.attribute) {
      const pack = filterAttributes(input.attribute);
      await new StringValueOperation(this.transaction, Field4stringEntity).save(beforeItem, pack.string);
    }

    return input.id ? input.id : id;
  }

}