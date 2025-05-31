import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../../common/operation/string/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag/flag-value-update.operation';
import { CollectionInput } from '../../input/Collection.input';
import { CollectionEntity } from '../../model/collection.entity';
import { Collection4stringEntity } from '../../model/collection4string.entity';
import { Collection2flagEntity } from '../../model/collection2flag.entity';

export class CollectionUpdateOperation {
  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    return NoDataException.assert(
      await this.manager
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

    await new FlagValueUpdateOperation(this.manager, Collection2flagEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Collection4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}