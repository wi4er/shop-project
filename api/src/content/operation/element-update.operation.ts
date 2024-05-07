import { EntityManager } from 'typeorm';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { ElementEntity } from '../model/element.entity';
import { ElementInput } from '../input/element.input';
import { Element4stringEntity } from '../model/element4string.entity';
import { Element2flagEntity } from '../model/element2flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { PointValueUpdateOperation } from '../../common/operation/point-value-update.operation';
import { Element4pointEntity } from '../model/element4point.entity';
import { Element4elementUpdateOperation } from './element4element-update.operation';
import { Element2imageEntity } from '../model/element2image.entity';
import { ImageUpdateOperation } from '../../common/operation/image-update.operation';

export class ElementUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkBlock(id?: number): Promise<BlockEntity> {
    WrongDataException.assert(id, 'Block id expected!');

    return WrongDataException.assert(
      await this.manager
        .getRepository<BlockEntity>(BlockEntity)
        .findOne({where: {id}}),
      `Block id ${id} not found!`,
    );
  }

  /**
   *
   * @param id
   * @private
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
      `Element with id ${id} not found!`,
    );
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: ElementInput): Promise<string> {
    try {
      await this.manager.update(ElementEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Element id expected'),
        sort: input.sort,
        block: await this.checkBlock(input.block),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkElement(input.id);

    const [stringList, pointList, elemList] = filterProperties(input.property);
    await new ImageUpdateOperation(this.manager, Element2imageEntity).save(beforeItem, input.image);
    await new StringValueUpdateOperation(this.manager, Element4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Element2flagEntity).save(beforeItem, input);
    await new PointValueUpdateOperation(this.manager, Element4pointEntity).save(beforeItem, pointList);
    await new Element4elementUpdateOperation(this.manager).save(beforeItem, elemList);

    return input.id;
  }

}