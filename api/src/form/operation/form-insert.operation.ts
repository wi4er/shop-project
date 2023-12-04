import { EntityManager } from 'typeorm';
import { PropertyValueInsertOperation } from '../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { FormEntity } from '../model/form.entity';
import { Form2stringEntity } from '../model/form2string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';

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

    await new PropertyValueInsertOperation(this.manager, Form2stringEntity).save(this.created, input);
    await new FlagValueInsertOperation(this.manager, Form2flagEntity).save(this.created, input);

    return this.created.id;
  }

}