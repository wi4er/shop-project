import { EntityManager } from 'typeorm';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { ElementEntity } from '../../model/element/element.entity';
import { Element4stringEntity } from '../../model/element/element4string.entity';
import { Element2flagEntity } from '../../model/element/element2flag.entity';
import { ElementInput } from '../../input/element.input';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PointValueInsertOperation } from '../../../common/operation/point-value-insert.operation';
import { Element4pointEntity } from '../../model/element/element4point.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PermissionValueInsertOperation } from '../../../common/operation/permission-value-insert.operation';
import { Element2permissionEntity } from '../../model/element/element2permission.entity';
import { Element4elementInsertOperation } from './element4element-insert.operation';
import { ImageInsertOperation } from '../../../common/operation/image-insert.operation';
import { Element2imageEntity } from '../../model/element/element2image.entity';

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

    await new ImageInsertOperation(this.transaction, Element2imageEntity).save(this.created, input.image);
    await new FlagValueInsertOperation(this.transaction, Element2flagEntity).save(this.created, input);
    await new PermissionValueInsertOperation(this.transaction, Element2permissionEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.transaction, Element4stringEntity).save(this.created, pack.string);
    await new PointValueInsertOperation(this.transaction, Element4pointEntity).save(this.created, pack.point);
    await new Element4elementInsertOperation(this.transaction).save(this.created, pack.element);

    return this.created.id;
  }

}