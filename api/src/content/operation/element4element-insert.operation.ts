import { EntityManager } from 'typeorm';
import { ElementEntity } from '../model/element.entity';
import { PropertyElementInput } from '../../common/input/property-element.input';
import { Element4elementEntity } from '../model/element4element.entity';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class Element4elementInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkElement(id: string): Promise<ElementEntity> {
    const propRepo = this.trans.getRepository(ElementEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Element with id ${id} not found!`);
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkProperty(id: string): Promise<AttributeEntity> {
    const propRepo = this.trans.getRepository(AttributeEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Property with id ${id} not found!`);
  }

  /**
   *
   * @param created
   * @param list
   */
  async save(created: ElementEntity, list: PropertyElementInput[]) {
    for (const item of list ?? []) {
      const inst = new Element4elementEntity();
      inst.parent = created;
      inst.attribute = await this.checkProperty(item.attribute);
      inst.element = await this.checkElement(item.element);

      await this.trans.save(inst);
    }
  }

}