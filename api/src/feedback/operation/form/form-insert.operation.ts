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

export class FormInsertOperation {

  created: FormEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FormEntity();
  }

  /**
   *
   */
  async save(input: FormInput): Promise<string> {
    this.created.id = input.id;

    await this.manager.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });

    await new FlagValueOperation(this.manager, this.created).save(Form2flagEntity, input.flag);
    await new FieldValueOperation(this.manager, Form2fieldEntity).save(this.created, input.field);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Form4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}