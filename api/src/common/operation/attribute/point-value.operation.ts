import { BaseEntity, EntityManager } from 'typeorm';
import { WithPointEntity } from '../../model/with/with-point.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PointEntity } from '../../../registry/model/point/point.entity';
import { AttributePointInput } from '../../input/attribute/attribute-point.input';
import { CommonPointEntity } from '../../model/common/common-point.entity';

export class PointValueOperation<T extends WithPointEntity<BaseEntity>> {

  constructor(
    private transaction: EntityManager,
    private entity: new() => CommonPointEntity<T>,
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
  async save(beforeItem: T, list: AttributePointInput[]) {
    const current: { [key: string]: Array<CommonPointEntity<BaseEntity>> } = {};

    for (const item of beforeItem.point ?? []) {
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
      inst.point = await this.checkPoint(item.point);

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