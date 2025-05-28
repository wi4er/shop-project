import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { BlockInput } from '../../input/block.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Block2flagEntity } from '../../model/block/block2flag.entity';
import { AttributeEntity } from '../../../settings/model/attribute.entity';

export class BlockPatchOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id: string): Promise<BlockEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(BlockEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
            description: {attribute: true, lang: true},
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
  async save(id: string, input: BlockInput): Promise<string> {
    if (input.id) await this.transaction.update(BlockEntity, {id}, {id: input.id});

    const beforeItem = await this.checkBlock(input.id ? input.id : id);
    if (input.flag) await new FlagValueUpdateOperation(this.transaction, Block2flagEntity).save(beforeItem, input);

    return  input.id ? input.id : beforeItem.id;
  }

}