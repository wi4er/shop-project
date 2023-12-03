import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { PropertyUpdateOperation } from '../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../common/operation/flag-update.operation';
import { BlockInput } from '../input/block.input';
import { Block2stringEntity } from '../model/block2string.entity';
import { Block2flagEntity } from '../model/block2flag.entity';

export class BlockUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkBlock(id: number): Promise<BlockEntity> {
    const blockRepo = this.manager.getRepository(BlockEntity);

    const inst = await blockRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Block not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: number, input: BlockInput): Promise<number> {
    const beforeItem = await this.checkBlock(id);

    await beforeItem.save();

    await new PropertyUpdateOperation(this.manager, Block2stringEntity).save(beforeItem, input);
    await new FlagUpdateOperation(this.manager, Block2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}