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

export class BlockInsertOperation {

  created: BlockEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new BlockEntity();
  }

  /**
   *
   * @param input
   */
  async save(input: BlockInput): Promise<number> {
    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Block4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Block4pointEntity).save(this.created, pointList);
    await new FlagValueInsertOperation(this.manager, Block2flagEntity).save(this.created, input);

    return this.created.id;
  }

}