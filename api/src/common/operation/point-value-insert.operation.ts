import { EntityManager } from 'typeorm';
import { PropertyEntity } from '../../settings/model/property.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { CommonPointEntity } from '../model/common-point.entity';
import { PropertyPointInput } from '../input/property-point.input';
import { WithPointEntity } from '../model/with-point.entity';
import { PointEntity } from '../../directory/model/point.entity';

export class PointValueInsertOperation<T extends WithPointEntity<T>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonPointEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkProperty(id?: string): Promise<PropertyEntity> {
    const propRepo = this.trans.getRepository(PropertyEntity);

    return WrongDataException.assert(
      await propRepo.findOne({where: {id}}),
      `Property with id >> ${id} << not found`
    );
  }

  /**
   *
   */
  private async checkPoint(id?: string): Promise<PointEntity> {
    const pointRepo = this.trans.getRepository(PointEntity);

    return  WrongDataException.assert(
      await pointRepo.findOne({where: {id}}),
      `Point with id >> ${id} << not found`
    );
  }

  /**
   *
   */
  async save(created: T, list: PropertyPointInput[]) {
    for (const item of list) {
      const inst = new this.entity();
      inst.parent = created;
      inst.property = await this.checkProperty(item.property);
      inst.point = await this.checkPoint(item.point);

      await this.trans.save(inst)
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

}