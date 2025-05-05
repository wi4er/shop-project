import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { BlockInput } from '../../input/block.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Block2flagEntity } from '../../model/block2flag.entity';

export class BlockPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id: number): Promise<BlockEntity> {
    const blockRepo = this.manager.getRepository(BlockEntity);

    return NoDataException.assert(
      await blockRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          point: {attribute: true, point: true},
          flag: {flag: true},
          permission: {group: true},
        },
      }),
      `Block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: number, input: BlockInput): Promise<number> {
    const beforeItem = await this.checkBlock(id);

    await beforeItem.save();

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Block2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}