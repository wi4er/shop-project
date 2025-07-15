import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { LangEntity } from '../../model/lang/lang.entity';
import { LangInput } from '../../input/lang/lang.input';
import { Lang4stringEntity } from '../../model/lang/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang/lang2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class LangUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkLang(id: string): Promise<LangEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(LangEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
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
      await this.transaction.update(LangEntity, {id}, {
        id: WrongDataException.assert(input.id, 'LangEntity id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkLang(input.id);

    await new FlagValueOperation(this.transaction, beforeItem).save(Lang2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Lang4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}