import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { BlockInput } from '../input/block.input';
import { Block2stringEntity } from '../model/block2string.entity';
import { Block2flagEntity } from '../model/block2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';

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

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Block2stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Block2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}