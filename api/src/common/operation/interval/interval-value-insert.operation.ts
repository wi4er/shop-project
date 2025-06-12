import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { WithStringEntity } from '../../model/with/with-string.entity';
import { AttributeIntervalInput } from '../../input/attribute-interval.input';
import { CommonIntervalEntity } from '../../model/common/common-interval.entity';
import { UnauthorizedException } from '@nestjs/common';

export class IntervalValueInsertOperation<T extends WithStringEntity<T>> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonIntervalEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkAttribute(id: string): Promise<AttributeEntity> {
    return WrongDataException.assert(
      await this.trans
        .getRepository(AttributeEntity)
        .findOne({where: {id}}),
      `Attribute with id >> ${id} << not found`,
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
  async save(created: T, list: AttributeIntervalInput[]): Promise<undefined> {
    for (const item of list ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.attribute = await this.checkAttribute(
        WrongDataException.assert(item.attribute, 'Attribute id expected')
      );

      inst.from = this.checkDate(item.from);
      inst.to = item.to ? this.checkDate(item.to) : null;

      await this.trans.save(inst);
    }
  }

}