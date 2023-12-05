import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { PropertyInput } from '../input/property.input';
import { PropertyEntity } from '../model/property.entity';
import { Property2stringEntity } from '../model/property2string.entity';
import { Property2flagEntity } from '../model/property2flag.entity';

export class PropertyUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    const propRepo = this.manager.getRepository(PropertyEntity);

    const inst = await propRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Property not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: PropertyInput): Promise<string> {
    const beforeItem = await this.checkProperty(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Property2stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Property2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}