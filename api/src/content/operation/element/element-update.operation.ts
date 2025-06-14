import { EntityManager } from 'typeorm';
import { ElementEntity } from '../../model/element/element.entity';
import { ElementInput } from '../../input/element/element.input';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { Element4elementUpdateOperation } from './element4element-update.operation';
import { Element2imageEntity } from '../../model/element/element2image.entity';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { Element4descriptionEntity } from '../../model/element/element4description.entity';
import { Element4IntervalEntity } from '../../model/element/element4interval.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { DescriptionValueOperation } from '../../../common/operation/attribute/description-value.operation';
import { IntervalValueOperation } from '../../../common/operation/attribute/interval-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';
import { ImageValueOperation } from '../../../common/operation/image-value.operation';

export class ElementUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id?: string): Promise<BlockEntity> {
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
            string: {attribute: true, lang: true},
            description: {attribute: true, lang: true},
            interval: {attribute: true},
            flag: {flag: true},
            image: {image: true},
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
        block: await this.checkBlock(
          WrongDataException.assert(input.block, 'Block id expected!')
        ),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkElement(input.id);

    await new ImageValueOperation(this.transaction, Element2imageEntity).save(beforeItem, input.image);
    await new FlagValueOperation(this.transaction, Element2flagEntity).save(beforeItem, input.flag);
    await new PermissionValueOperation(this.transaction, Element2permissionEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Element4stringEntity).save(beforeItem, pack.string);
    await new DescriptionValueOperation(this.transaction, Element4descriptionEntity).save(beforeItem, pack.description);
    await new IntervalValueOperation(this.transaction, Element4IntervalEntity).save(beforeItem, pack.interval);
    await new PointValueOperation(this.transaction, Element4pointEntity).save(beforeItem, pack.point);
    await new Element4elementUpdateOperation(this.transaction).save(beforeItem, pack.element);

    return input.id;
  }

}