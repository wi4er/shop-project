import { BaseEntity, EntityManager } from 'typeorm';
import { WithPointEntity } from '../model/with-point.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { PointEntity } from '../../directory/model/point.entity';
import { PropertyPointInput } from '../input/property-point.input';
import { CommonPointEntity } from '../model/common-point.entity';

export class PointValueUpdateOperation<T extends WithPointEntity<BaseEntity>> {


  constructor(
    private trans: EntityManager,
    private entity: new() => CommonPointEntity<T>,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    const propRepo = this.trans.getRepository(PropertyEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Property id ${id} not found!`);
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkPoint(id: string): Promise<PointEntity> {
    const propRepo = this.trans.getRepository(PointEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Point id ${id} not found!`);
  }

  /**
   *
   * @param beforeItem
   * @param list
   */
  async save(beforeItem: T, list: PropertyPointInput[]) {
    const current: { [key: string]: Array<CommonPointEntity<BaseEntity>> } = {};

    for (const item of beforeItem.point) {
      const {id} = item.property;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.property]?.length
        ? current[item.property].shift()
        : new this.entity();

      inst.parent = beforeItem;
      inst.property = await this.checkProperty(item.property);
      inst.point = await this.checkPoint(item.point)

      await this.trans.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.trans.delete(this.entity, item.id);
    }
  }

}