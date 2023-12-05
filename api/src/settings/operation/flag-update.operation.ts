import { FlagEntity } from '../model/flag.entity';
import { EntityManager } from 'typeorm';
import { Flag2stringEntity } from '../model/flag2string.entity';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { PropertyInput } from '../input/property.input';
import { LangInput } from '../input/lang.input';

export class FlagUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    const flagRepo = this.manager.getRepository(FlagEntity);

    const inst = await flagRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Flag not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: LangInput): Promise<string> {
    const beforeItem = await this.checkFlag(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Flag2stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Flag2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}