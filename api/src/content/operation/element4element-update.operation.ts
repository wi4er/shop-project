import { EntityManager } from 'typeorm';
import { PropertyEntity } from '../../settings/model/property.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { ElementEntity } from '../model/element.entity';
import { Element4elementEntity } from '../model/element4element.entity';
import { PropertyElementInput } from '../../common/input/property-element.input';

export class Element4elementUpdateOperation {

  constructor(
    private trans: EntityManager,
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
  private async checkElement(id: string): Promise<ElementEntity> {
    const elemRepo = this.trans.getRepository(ElementEntity);
    const inst = await elemRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Element id ${id} not found!`);
  }

  /**
   *
   * @param beforeItem
   * @param list
   */
  async save(beforeItem: ElementEntity, list: PropertyElementInput[]) {
    const current: { [key: string]: Element4elementEntity[] } = {};

    for (const item of beforeItem.element) {
      const {id} = item.property;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.property]?.length
        ? current[item.property].shift()
        : new Element4elementEntity();

      inst.parent = beforeItem;
      inst.property = await this.checkProperty(item.property);
      inst.element = await this.checkElement(item.element)

      await this.trans.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.trans.delete(Element4elementEntity, item.id);
    }
  }

}