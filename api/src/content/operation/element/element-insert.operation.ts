import { EntityManager } from 'typeorm';
import { ElementEntity } from '../../model/element/element.entity';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { ElementInput } from '../../input/element/element.input';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { Element4elementInsertOperation } from './element4element-insert.operation';
import { Element2imageEntity } from '../../model/element/element2image.entity';
import { Element4descriptionEntity } from '../../model/element/element4description.entity';
import { Element4IntervalEntity } from '../../model/element/element4interval.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { DescriptionValueOperation } from '../../../common/operation/attribute/description-value.operation';
import { IntervalValueOperation } from '../../../common/operation/attribute/interval-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';
import { ImageValueOperation } from '../../../common/operation/image-value.operation';
import { CounterValueOperation } from '../../../common/operation/attribute/counter-value.operation';
import { Element4counterEntity } from '../../model/element/element4counter.entity';

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
    this.created.block = await this.checkBlock(
      WrongDataException.assert(input.block, 'Block id expected!'),
    );

    try {
      await this.transaction.insert(ElementEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new ImageValueOperation(this.transaction, Element2imageEntity).save(this.created, input.image);
    await new FlagValueOperation(this.transaction, this.created).save(Element2flagEntity, input.flag);
    await new PermissionValueOperation(this.transaction, Element2permissionEntity).save(this.created, input.permission);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, this.created).save(Element4stringEntity, pack.string);
    await new DescriptionValueOperation(this.transaction, Element4descriptionEntity).save(this.created, pack.description);
    await new IntervalValueOperation(this.transaction, Element4IntervalEntity).save(this.created, pack.interval);
    await new PointValueOperation(this.transaction, Element4pointEntity).save(this.created, pack.point);
    await new CounterValueOperation(this.transaction, Element4counterEntity).save(this.created, pack.counter);
    await new Element4elementInsertOperation(this.transaction).save(this.created, pack.element);

    return this.created.id;
  }

}