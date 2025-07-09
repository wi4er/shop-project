import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { FormEntity } from '../../model/form/form.entity';
import { Form2flagEntity } from '../../model/form/form2flag.entity';
import { FormInput } from '../../input/form/form.input';

export class FormPatchOperation {
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

    if (input.id) await this.transaction.update(FormEntity, {id}, {id: input.id});
    if (input.flag) await new FlagValueOperation(this.transaction, Form2flagEntity).save(beforeItem, input.flag);

    return input.id ? input.id : beforeItem.id;
  }

}