import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { LangEntity } from '../../model/lang/lang.entity';
import { LangInput } from '../../input/lang/lang.input';
import { Lang2flagEntity } from '../../model/lang/lang2flag.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';

export class LangPatchOperation {

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
    const beforeItem = await this.checkLang(id);

    if (input.id) await this.transaction.update(LangEntity, {id}, {id: input.id});
    if (input.flag) await new FlagValueOperation(this.transaction, Lang2flagEntity).save(beforeItem, input.flag);

    return input.id ? input.id : beforeItem.id;
  }

}