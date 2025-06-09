import { EntityManager } from 'typeorm';
import { StringValueUpdateOperation } from '../../../common/operation/string/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag/flag-value-update.operation';
import { ElementEntity } from '../../model/element/element.entity';
import { ElementInput } from '../../input/element.input';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PointValueUpdateOperation } from '../../../common/operation/point/point-value-update.operation';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { Element4elementUpdateOperation } from './element4element-update.operation';
import { Element2imageEntity } from '../../model/element/element2image.entity';
import { ImageUpdateOperation } from '../../../common/operation/image/image-update.operation';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission/permission-value-update.operation';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import {
  DescriptionValueUpdateOperation,
} from '../../../common/operation/description/description-value-update.operation';
import { Element4descriptionEntity } from '../../model/element/element4description.entity';

export class ElementUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id?: string): Promise<BlockEntity> {
    WrongDataException.assert(id, 'BlockEntity id expected!');

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
    return NoDataException.assert(
      await this.transaction
        .getRepository(ElementEntity)
        .findOne({
          where: {id},
          relations: {
            image: {image: true},
            string: {attribute: true, lang: true},
            description: {attribute: true, lang: true},
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
        id: WrongDataException.assert(input.id, 'Element id expected'),
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

    const pack = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.transaction, Element4stringEntity).save(beforeItem, pack.string);
    await new PointValueUpdateOperation(this.transaction, Element4pointEntity).save(beforeItem, pack.point);
    await new DescriptionValueUpdateOperation(this.transaction, Element4descriptionEntity).save(beforeItem, pack.description);
    await new Element4elementUpdateOperation(this.transaction).save(beforeItem, pack.element);

    return input.id;
  }

}