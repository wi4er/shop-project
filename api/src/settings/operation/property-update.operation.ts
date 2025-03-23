import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { PropertyInput } from '../input/property.input';
import { PropertyEntity } from '../model/property.entity';
import { Property4stringEntity } from '../model/property4string.entity';
import { Property2flagEntity } from '../model/property2flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

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

    return NoDataException.assert(inst, `Property > ${inst.id} < not found!`);
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: PropertyInput): Promise<string> {
    try {
      await this.manager.update(PropertyEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Property id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkProperty(input.id);

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Property4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Property2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}