import { EntityManager } from 'typeorm';
import { ElementEntity } from '../model/element.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { ElementInput } from '../input/element.input';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { Element2flagEntity } from '../model/element2flag.entity';

export class ElementPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkElement(id: string): Promise<ElementEntity> {
    const elementRepo = this.manager.getRepository(ElementEntity);

    return NoDataException.assert(
      await elementRepo.findOne({
        where: {id},
        relations: {
          image: {image: true},
          string: {property: true},
          flag: {flag: true},
          point: {point: true, property: true},
          element: {element: true, property: true},
          permission: {group: true},
        },
      }),
      `Element with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: ElementInput): Promise<string> {
    const beforeItem = await this.checkElement(id);

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Element2flagEntity).save(beforeItem, input);

    return id;
  }

}