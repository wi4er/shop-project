import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { Block4stringEntity } from '../../model/block/block4string.entity';
import { Block2flagEntity } from '../../model/block/block2flag.entity';
import { BlockInput } from '../../input/block/block.input';
import { Block4pointEntity } from '../../model/block/block4point.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { Block4descriptionEntity } from '../../model/block/block4description.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { DescriptionValueOperation } from '../../../common/operation/attribute/description-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';

export class BlockInsertOperation {

  created: BlockEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new BlockEntity();
  }

  /**
   *
   */
  async save(input: BlockInput): Promise<string> {
    if (input.sort) this.created.sort = input.sort;
    this.created.id = input.id;

    try {
      await this.manager.insert(BlockEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new PermissionValueOperation(this.manager, Block2permissionEntity).save(this.created, input.permission);
    await new FlagValueOperation(this.manager, this.created).save(Block2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Block4stringEntity).save(this.created, pack.string);
    await new PointValueOperation(this.manager, Block4pointEntity).save(this.created, pack.point);
    await new DescriptionValueOperation(this.manager, Block4descriptionEntity).save(this.created, pack.description);

    return this.created.id;
  }

}