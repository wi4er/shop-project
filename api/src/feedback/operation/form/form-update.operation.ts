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
    try {
      await this.transaction.update(FormEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Form id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkForm(input.id);
    await beforeItem.save();

    await new FlagValueOperation(this.transaction, Form2flagEntity).save(beforeItem, input.flag);
    await new FieldValueOperation(this.transaction, Form2fieldEntity).save(beforeItem, input.field);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Form4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}