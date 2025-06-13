import { EntityManager } from 'typeorm';
import { FlagEntity } from '../../model/flag.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { FlagInput } from '../../input/flag.input';
import { Flag2flagEntity } from '../../model/flag2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { Flag4stringEntity } from '../../model/flag4string.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';

export class FlagPatchOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(FlagEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
            flag: {flag: true},
          },
        }),
      `Flag with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: FlagInput): Promise<string> {
    if (input.id) await this.transaction.update(FlagEntity, {id}, {id: input.id});

    const beforeItem = await this.checkFlag(input.id ? input.id : id);

    if (input.flag) await new FlagValueOperation(this.transaction, Flag2flagEntity).save(beforeItem, input.flag);
    if (input.attribute) {
      const pack = filterAttributes(input.attribute);
      await new StringValueOperation(this.transaction, Flag4stringEntity).save(beforeItem, pack.string);
    }

    return input.id ? input.id : id;
  }

}