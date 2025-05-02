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
import { filterAttributes } from '../../common/input/filter-attributes';
import { PointValueUpdateOperation } from '../../common/operation/point-value-update.operation';
import { Element4pointEntity } from '../model/element4point.entity';
import { Element4elementUpdateOperation } from './element4element-update.operation';
import { Element2imageEntity } from '../model/element2image.entity';
import { ImageUpdateOperation } from '../../common/operation/image-update.operation';
import { PermissionValueUpdateOperation } from '../../common/operation/permission-value-update.operation';
import { Element2permissionEntity } from '../model/element2permission.entity';

export class ElementUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id?: number): Promise<BlockEntity> {
    WrongDataException.assert(id, 'Block id expected!');

    return WrongDataException.assert(
      await this.transaction
        .getRepository<BlockEntity>(BlockEntity)
        .findOne({where: {id}}),
      `Block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkElement(id: string): Promise<ElementEntity> {
    const elementRepo = this.transaction.getRepository(ElementEntity);

    return NoDataException.assert(
      await elementRepo.findOne({
        where: {id},
        relations: {
          image: {image: true},
          string: {attribute: true},
          flag: {flag: true},
          point: {point: true, attribute: true},
          element: {element: true, attribute: true},
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
    try {
      await this.transaction.update(ElementEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Element id expected'),
        sort: input.sort,
        block: await this.checkBlock(input.block),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkElement(input.id);

    await new ImageUpdateOperation(this.transaction, Element2imageEntity).save(beforeItem, input.image);
    await new FlagValueUpdateOperation(this.transaction, Element2flagEntity).save(beforeItem, input);
    await new PermissionValueUpdateOperation(this.transaction, Element2permissionEntity).save(beforeItem, input);

    const [stringList, pointList, elemList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.transaction, Element4stringEntity).save(beforeItem, stringList);
    await new PointValueUpdateOperation(this.transaction, Element4pointEntity).save(beforeItem, pointList);
    await new Element4elementUpdateOperation(this.transaction).save(beforeItem, elemList);

    return input.id;
  }

}