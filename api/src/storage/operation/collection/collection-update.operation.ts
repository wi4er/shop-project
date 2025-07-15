import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { CollectionInput } from '../../input/collection/collection.input';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { Collection4stringEntity } from '../../model/collection/collection4string.entity';
import { Collection2flagEntity } from '../../model/collection/collection2flag.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class CollectionUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(CollectionEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `Collection with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: CollectionInput): Promise<string> {
    const beforeItem = await this.checkCollection(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    await new FlagValueOperation(this.transaction, beforeItem).save(Collection2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Collection4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}