import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { FormEntity } from '../model/form.entity';
import { Form4stringEntity } from '../model/form4string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';
import { filterAttributes } from '../../common/input/filter-attributes';

export class FormUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkForm(id: string): Promise<FormEntity> {
    const formRepo = this.manager.getRepository(FormEntity);

    return NoDataException.assert(
      await formRepo.findOne({
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

    await new FlagValueUpdateOperation(this.manager, Form2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Form4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}