import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { CommonPointEntity } from '../../model/common/common-point.entity';
import { AttributePointInput } from '../../input/attribute-point.input';
import { WithPointEntity } from '../../model/with/with-point.entity';
import { PointEntity } from '../../../registry/model/point.entity';

export class PointValueInsertOperation<T extends WithPointEntity<T>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonPointEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkProperty(id?: string): Promise<AttributeEntity> {
    const propRepo = this.trans.getRepository(AttributeEntity);

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
  async save(created: T, list: AttributePointInput[]) {
    for (const item of list) {
      const inst = new this.entity();
      inst.parent = created;
      inst.attribute = await this.checkProperty(item.attribute);
      inst.point = await this.checkPoint(item.point);

      await this.trans.save(inst)
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

}