import { BaseEntity, EntityManager } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { CommonIntervalEntity } from '../../model/common/common-interval.entity';
import { AttributeIntervalInput } from '../../input/attribute/attribute-interval.input';
import { WithIntervalEntity } from '../../model/with/with-interval.entity';

export class IntervalValueOperation<T extends WithIntervalEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonIntervalEntity<T>,
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
  checkDate(value: string): Date {
    const date = new Date(value);

    if (date instanceof Date && isNaN(+date)) {
      throw new WrongDataException(`Invalid date format for ${value}`)
    }

    return date;
  }

  /**
   *
   */
  async save(beforeItem: T, list: AttributeIntervalInput[]) {
    const current: { [key: string]: Array<CommonIntervalEntity<BaseEntity>> } = {};

    for (const item of beforeItem.interval ?? []) {
      const {id} = item.attribute;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.attribute]?.length
        ? current[item.attribute].shift()
        : new this.entity();

      inst.parent = beforeItem;
      inst.attribute = await this.checkAttribute(
        WrongDataException.assert(item.attribute, 'Attribute expected')
      );
      inst.from = this.checkDate(item.from);
      inst.to = item.to ? this.checkDate(item.to) : null;

      await this.transaction.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.transaction.delete(this.entity, item.id);
    }
  }

}