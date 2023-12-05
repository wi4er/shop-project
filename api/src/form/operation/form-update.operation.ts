import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { FormEntity } from '../model/form.entity';
import { Form2stringEntity } from '../model/form2string.entity';
import { Form2flagEntity } from '../model/form2flag.entity';
import { FormInput } from '../input/form.input';
import { filterProperties } from '../../common/input/filter-properties';

export class FormUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkForm(id: string): Promise<FormEntity> {
    const formRepo = this.manager.getRepository(FormEntity);

    const inst = await formRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Form not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: FormInput): Promise<string> {
    const beforeItem = await this.checkForm(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Form2stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Form2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}