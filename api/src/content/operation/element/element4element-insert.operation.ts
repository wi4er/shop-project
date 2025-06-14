import { EntityManager } from 'typeorm';
import { ElementEntity } from '../../model/element/element.entity';
import { AttributeElementInput } from '../../../common/input/attribute/attribute-element.input';
import { Element4elementEntity } from '../../model/element/element4element.entity';
import { AttributeEntity } from '../../../settings/model/attribute/attribute.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class Element4elementInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkElement(id: string): Promise<ElementEntity> {
    const propRepo = this.trans.getRepository(ElementEntity);

    return WrongDataException.assert(
      await propRepo.findOne({where: {id}}),
      `Element with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  private async checkProperty(id: string): Promise<AttributeEntity> {
    const propRepo = this.trans.getRepository(AttributeEntity);

    return WrongDataException.assert(
      await propRepo.findOne({where: {id}}),
      `Property with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(created: ElementEntity, list: AttributeElementInput[]) {
    for (const item of list ?? []) {
      const inst = new Element4elementEntity();
      inst.parent = created;
      inst.attribute = await this.checkProperty(item.attribute);
      inst.element = await this.checkElement(item.element);

      await this.trans.save(inst)
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    }
  }

}