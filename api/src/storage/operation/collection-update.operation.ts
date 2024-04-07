import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { CollectionInput } from '../input/Collection.input';
import { CollectionEntity } from '../model/collection.entity';
import { Collection4stringEntity } from '../model/collection4string.entity';
import { Collection2flagEntity } from '../model/collection2flag.entity';

export class CollectionUpdateOperation {
  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    const colRepo = this.manager.getRepository(CollectionEntity);

    const inst = await colRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, `Collection with id ${id} not found!`);

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: CollectionInput): Promise<string> {
    const beforeItem = await this.checkCollection(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Collection4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Collection2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}