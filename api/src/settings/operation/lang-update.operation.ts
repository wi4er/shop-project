import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { LangEntity } from '../model/lang.entity';
import { LangInput } from '../input/lang.input';
import { Lang4stringEntity } from '../model/lang4string.entity';
import { Lang2flagEntity } from '../model/lang2flag.entity';

export class LangUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkFlag(id: string): Promise<LangEntity> {
    const flagRepo = this.manager.getRepository(LangEntity);

    const inst = await flagRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Lang not found!');

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
    await new StringValueUpdateOperation(this.manager, Lang4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Lang2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}