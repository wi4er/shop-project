import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { LangEntity } from '../../model/lang.entity';
import { LangInput } from '../../input/lang.input';
import { Lang4stringEntity } from '../../model/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';

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
        id: WrongDataException.assert(input.id, 'LangEntity id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkFlag(input.id);

    await new FlagValueOperation(this.manager, Lang2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Lang4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}