import { EntityManager } from 'typeorm';
import { CollectionEntity } from '../../model/collection.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { CollectionInput } from '../../input/Collection.input';
import { Collection4stringEntity } from '../../model/collection4string.entity';
import { Collection2flagEntity } from '../../model/collection2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';

export class CollectionInsertOperation {

  created: CollectionEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new CollectionEntity();
  }

  /**
   *
   */
  async save(input: CollectionInput): Promise<string> {
    this.created.id = input.id;

    try {
      await this.transaction.insert(CollectionEntity, this.created)
    } catch(err) {
      throw new WrongDataException(err.message);
    }

    await new FlagValueOperation(this.transaction, Collection2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Collection4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}