import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { ElementEntity } from '../../model/element/element.entity';
import { Element4elementEntity } from '../../model/element/element4element.entity';
import { AttributeElementInput } from '../../../common/input/attribute/attribute-element.input';

export class Element4elementUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkProperty(id: string): Promise<AttributeEntity> {
    const propRepo = this.trans.getRepository(AttributeEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Property id ${id} not found!`);
  }

  /**
   *
   */
  private async checkElement(id: string): Promise<ElementEntity> {
    const elemRepo = this.trans.getRepository(ElementEntity);
    const inst = await elemRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Element id ${id} not found!`);
  }

  /**
   *
   */
  async save(beforeItem: ElementEntity, list: AttributeElementInput[]) {
    const current: { [key: string]: Element4elementEntity[] } = {};

    for (const item of beforeItem.element) {
      const {id} = item.attribute;

      if (current[id]) current[id].push(item);
      else current[id] = [item];
    }

    for (const item of list) {
      const inst = current[item.attribute]?.length
        ? current[item.attribute].shift()
        : new Element4elementEntity();

      inst.parent = beforeItem;
      inst.attribute = await this.checkProperty(item.attribute);
      inst.element = await this.checkElement(item.element)

      await this.trans.save(inst);
    }

    for (const item of Object.values(current).flat()) {
      await this.trans.delete(Element4elementEntity, item.id);
    }
  }

}