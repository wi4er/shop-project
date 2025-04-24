import { EntityManager } from 'typeorm';
import { CollectionEntity } from '../model/collection.entity';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { CollectionInput } from '../input/Collection.input';
import { Collection4stringEntity } from '../model/collection4string.entity';
import { Collection2flagEntity } from '../model/collection2flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class CollectionInsertOperation {

  created: CollectionEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new CollectionEntity();
  }

  /**
   *
   */
  async save(input: CollectionInput): Promise<string> {
    this.created.id = input.id;

    try {
      await this.manager.insert(CollectionEntity, this.created)
    } catch(err) {
      throw new WrongDataException(err.message);
    }

    await new FlagValueInsertOperation(this.manager, Collection2flagEntity).save(this.created, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Collection4stringEntity).save(this.created, stringList);

    return this.created.id;
  }

}