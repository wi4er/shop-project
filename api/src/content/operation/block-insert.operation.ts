import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { Block4stringEntity } from '../model/block4string.entity';
import { Block2flagEntity } from '../model/block2flag.entity';
import { BlockInput } from '../input/block.input';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Block4pointEntity } from '../model/block4point.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { PermissionValueInsertOperation } from '../../common/operation/permission-value-insert.operation';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { Block2permissionEntity } from '../model/block2permission.entity';

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
  async save(input: BlockInput): Promise<number> {
    try {
      await this.manager.insert(BlockEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new PermissionValueInsertOperation(this.manager, Block2permissionEntity).save(this.created, input);
    await new FlagValueInsertOperation(this.manager, Block2flagEntity).save(this.created, input);

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueInsertOperation(this.manager, Block4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Block4pointEntity).save(this.created, pointList);

    return this.created.id;
  }

}