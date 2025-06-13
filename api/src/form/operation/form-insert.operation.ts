import { EntityManager } from 'typeorm';
import { FormEntity } from '../model/form.entity';
import { Form4stringEntity } from '../model/form4string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';
import { filterAttributes } from '../../common/input/filter-attributes';
import { FlagValueOperation } from '../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../common/operation/string-value.operation';

export class FormInsertOperation {

  created: FormEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FormEntity();
  }

  /**
   *
   * @param input
   */
  async save(input: FormInput): Promise<string> {
    this.created.id = input.id;
    await this.manager.save(this.created);

    await new FlagValueOperation(this.manager, Form2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Form4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}