import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../../common/operation/string/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag/flag-value-update.operation';
import { LangEntity } from '../../model/lang.entity';
import { LangInput } from '../../input/lang.input';
import { Lang4stringEntity } from '../../model/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class LangUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<LangEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(LangEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `Lang with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: LangInput): Promise<string> {
    try {
      await this.manager.update(LangEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Lang id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkFlag(input.id);

    await new FlagValueUpdateOperation(this.manager, Lang2flagEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Lang4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}