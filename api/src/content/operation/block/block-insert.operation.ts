import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { StringValueInsertOperation } from '../../../common/operation/string/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag/flag-value-insert.operation';
import { Block4stringEntity } from '../../model/block/block4string.entity';
import { Block2flagEntity } from '../../model/block/block2flag.entity';
import { BlockInput } from '../../input/block.input';
import { PointValueInsertOperation } from '../../../common/operation/point/point-value-insert.operation';
import { Block4pointEntity } from '../../model/block/block4point.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PermissionValueInsertOperation } from '../../../common/operation/permission/permission-value-insert.operation';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { DescriptionValueInsertOperation } from '../../../common/operation/description/description-value-insert.operation';
import { Block4descriptionEntity } from '../../model/block/block4description.entity';

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

    await new PermissionValueInsertOperation(this.manager, Block2permissionEntity).save(this.created, input);
    await new FlagValueInsertOperation(this.manager, Block2flagEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Block4stringEntity).save(this.created, pack.string);
    await new PointValueInsertOperation(this.manager, Block4pointEntity).save(this.created, pack.point);
    await new DescriptionValueInsertOperation(this.manager, Block4descriptionEntity).save(this.created, pack.description);

    return this.created.id;
  }

}