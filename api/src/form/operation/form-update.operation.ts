import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { FormEntity } from '../model/form.entity';
import { Form4stringEntity } from '../model/form4string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';
import { filterAttributes } from '../../common/input/filter-attributes';
import { FlagValueOperation } from '../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../common/operation/string-value.operation';

export class FormUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkForm(id: string): Promise<FormEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(FormEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `Form with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: FormInput): Promise<string> {
    const beforeItem = await this.checkForm(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    await new FlagValueOperation(this.manager, Form2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Form4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}