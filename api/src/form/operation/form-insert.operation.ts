import { EntityManager } from 'typeorm';
import { StringValueInsertOperation } from '../../common/operation/string/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag/flag-value-insert.operation';
import { FormEntity } from '../model/form.entity';
import { Form4stringEntity } from '../model/form4string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';
import { filterAttributes } from '../../common/input/filter-attributes';

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

    const pack = filterAttributes(input.attribute);

    await new StringValueInsertOperation(this.manager, Form4stringEntity).save(this.created, pack.string);
    await new FlagValueInsertOperation(this.manager, Form2flagEntity).save(this.created, input);

    return this.created.id;
  }

}