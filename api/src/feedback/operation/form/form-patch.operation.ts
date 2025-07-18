import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { FormEntity } from '../../model/form/form.entity';
import { Form2flagEntity } from '../../model/form/form2flag.entity';
import { FormInput } from '../../input/form/form.input';
import { FormLogInsertOperation } from '../log/form-log-insert.operation';
import { Form2logEntity } from '../../model/form/form2log.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

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
  async save(
    id: string,
    input: FormInput,
  ): Promise<string> {
    if (input.id) {
      await this.transaction.update(FormEntity, {id}, {id: input.id});
    } else {
      await this.transaction.update(FormEntity, {id}, {id});
    }

    const beforeItem = await this.checkForm(input.id ? input.id : id);

    if (input.id && input.id !== id) {
      await new FormLogInsertOperation(this.transaction).save(beforeItem, {
        version: beforeItem.version,
        value: `property.ID`,
        from: id,
        to: input.id,
      });
    }

    if (input.flag) {
      const flagsOperation = new FlagValueOperation(this.transaction, beforeItem);
      await flagsOperation.save(Form2flagEntity, input.flag);
      await flagsOperation.log(Form2logEntity, input.flag);
    }

    return input.id ? input.id : id;
  }

}