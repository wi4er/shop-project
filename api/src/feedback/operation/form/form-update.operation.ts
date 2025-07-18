import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FormEntity } from '../../model/form/form.entity';
import { Form4stringEntity } from '../../model/form/form4string.entity';
import { Form2flagEntity } from '../../model/form/form2flag.entity';
import { FormInput } from '../../input/form/form.input';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { FieldValueOperation } from '../../../common/operation/field-value.operation';
import { Form2fieldEntity } from '../../model/form/form2field.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FormLogInsertOperation } from '../log/form-log-insert.operation';
import { Form2logEntity } from '../../model/form/form2log.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

export class FormUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkForm(id: string): Promise<FormEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(FormEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
            flag: {flag: true},
          } as FindOptionsRelations<FormEntity>,
        }),
      `Form with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: FormInput): Promise<string> {
    try {
      await this.transaction.update(FormEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Form id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkForm(input.id);
    if (id !== input.id) {
      await new FormLogInsertOperation(this.transaction).save(beforeItem, {
        version: beforeItem.version,
        value: `property.ID`,
        from: id,
        to: input.id,
      });
    }

    const flagsOperation = new FlagValueOperation(this.transaction, beforeItem);
    await flagsOperation.save(Form2flagEntity, input.flag);
    await flagsOperation.log(Form2logEntity, input.flag);

    await new FieldValueOperation(this.transaction, Form2fieldEntity).save(beforeItem, input.field);

    const pack = filterAttributes(input.attribute);
    const stringsOperation = new StringValueOperation(this.transaction, beforeItem)
    await stringsOperation.save(Form4stringEntity, pack.string);
    await stringsOperation.log(Form2logEntity, pack.string);

    return beforeItem.id;
  }

}