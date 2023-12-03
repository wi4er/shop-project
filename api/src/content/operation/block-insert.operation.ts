import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { PropertyInsertOperation } from '../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../common/operation/flag-insert.operation';
import { Block2stringEntity } from '../model/block2string.entity';
import { Block2flagEntity } from '../model/block2flag.entity';
import { BlockInput } from '../input/block.input';

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

    await new PropertyInsertOperation(this.manager, Block2stringEntity).save(this.created, input);
    await new FlagInsertOperation(this.manager, Block2flagEntity).save(this.created, input);

    return this.created.id;
  }

}