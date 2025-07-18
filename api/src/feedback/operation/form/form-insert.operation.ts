import { EntityManager } from 'typeorm';
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
import { Form2logEntity } from '../../model/form/form2log.entity';
import { FormLogInsertOperation } from '../log/form-log-insert.operation';

export class FormInsertOperation {

  created: FormEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new FormEntity();
  }

  /**
   *
   */
  async save(input: FormInput): Promise<string> {
    this.created.id = input.id;

    await this.transaction.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });

    await new FormLogInsertOperation(this.transaction).save(this.created, {
      version: this.created.version,
      value: `property.ID`,
      from: null,
      to: input.id,
    });

    await new FlagValueOperation(this.transaction, this.created).save(Form2flagEntity, input.flag);
    await new FieldValueOperation(this.transaction, Form2fieldEntity).save(this.created, input.field);

    const pack = filterAttributes(input.attribute);
    const stringsOperation = new StringValueOperation(this.transaction, this.created);
    await stringsOperation.save(Form4stringEntity, pack.string);
    await stringsOperation.log(Form2logEntity, pack.string);

    return this.created.id;
  }

}