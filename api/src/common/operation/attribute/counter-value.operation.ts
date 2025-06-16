import { BaseEntity, EntityManager } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { AttributeCounterInput } from '../../input/attribute/attribute-counter.input';
import { CommonCounterEntity } from '../../model/common/common-counter.entity';
import { WithCounterEntity } from '../../model/with/with-counter.entity';

export class CounterValueOperation<T extends WithCounterEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonCounterEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository(AttributeEntity)
        .findOne({where: {id}}),
      `Attribute with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkPoint(id: string): Promise<PointEntity> {
    return WrongDataException.assert(
      this.transaction
        .getRepository(PointEntity)
        .findOne({where: {id}}),
      `Point with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(beforeItem: T, list: AttributeCounterInput[]) {
    const current: { [key: string]: Array<CommonCounterEntity<BaseEntity>> } = {};

    for (const item of beforeItem.counter ?? []) {
      const {id} = item.attribute;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.attribute]?.length
        ? current[item.attribute].shift()
        : new this.entity();

      inst.parent = beforeItem;
      inst.attribute = await this.checkAttribute(item.attribute);
      inst.point = await this.checkPoint(item.counter);
      inst.count = WrongDataException.assert(item.count, "Count expected!");

      await this.transaction.save(inst)
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    }

    for (const item of Object.values(current).flat()) {
      await this.transaction.delete(this.entity, item.id);
    }
  }

}