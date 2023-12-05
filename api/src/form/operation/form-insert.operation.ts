import { EntityManager } from 'typeorm';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { FormEntity } from '../model/form.entity';
import { Form2stringEntity } from '../model/form2string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';
import { filterProperties } from '../../common/input/filter-properties';

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

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Form2stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, Form2flagEntity).save(this.created, input);

    return this.created.id;
  }

}