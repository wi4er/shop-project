import { EntityManager } from 'typeorm';
import { ElementEntity } from '../../model/element/element.entity';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { ElementInput } from '../../input/element.input';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { Element4elementInsertOperation } from './element4element-insert.operation';
import { Element2imageEntity } from '../../model/element/element2image.entity';
import { Element4descriptionEntity } from '../../model/element/element4description.entity';
import { Element4IntervalEntity } from '../../model/element/element4interval.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';
import { PointValueOperation } from '../../../common/operation/point-value.operation';
import { DescriptionValueOperation } from '../../../common/operation/description-value.operation';
import { IntervalValueOperation } from '../../../common/operation/interval-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';
import { ImageValueOperation } from '../../../common/operation/image-value.operation';

export class ElementInsertOperation {

  created: ElementEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new ElementEntity();
  }

  /**
   *
   */
  private async checkBlock(id: string): Promise<BlockEntity> {
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
  async save(input: ElementInput): Promise<string> {
    this.created.id = input.id;
    if (input.sort) this.created.sort = input.sort;
    this.created.block = await this.checkBlock(input.block);

    try {
      await this.transaction.insert(ElementEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new ImageValueOperation(this.transaction, Element2imageEntity).save(this.created, input.image);
    await new FlagValueOperation(this.transaction, Element2flagEntity).save(this.created, input.flag);
    await new PermissionValueOperation(this.transaction, Element2permissionEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Element4stringEntity).save(this.created, pack.string);
    await new DescriptionValueOperation(this.transaction, Element4descriptionEntity).save(this.created, pack.description);
    await new IntervalValueOperation(this.transaction, Element4IntervalEntity).save(this.created, pack.interval);
    await new PointValueOperation(this.transaction, Element4pointEntity).save(this.created, pack.point);
    await new Element4elementInsertOperation(this.transaction).save(this.created, pack.element);

    return this.created.id;
  }

}