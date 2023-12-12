import { EntityManager } from 'typeorm';
import { ElementEntity } from '../model/element.entity';
import { PropertyElementInput } from '../../common/input/property-element.input';
import { Element4elementEntity } from '../model/element4element.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
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
  private async checkElement(id: number): Promise<ElementEntity> {
    const propRepo = this.trans.getRepository(ElementEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Element with id ${id} not found!`);
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkProperty(id: string): Promise<PropertyEntity> {
    const propRepo = this.trans.getRepository(PropertyEntity);
    const inst = await propRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Wrong property ${id}`);
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
      inst.property = await this.checkProperty(item.property);
      inst.element = await this.checkElement(item.element);

      await this.trans.save(inst);
    }
  }

}