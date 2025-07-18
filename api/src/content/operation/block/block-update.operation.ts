import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { BlockInput } from '../../input/block/block.input';
import { Block4stringEntity } from '../../model/block/block4string.entity';
import { Block2flagEntity } from '../../model/block/block2flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { Block4pointEntity } from '../../model/block/block4point.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { Block4descriptionEntity } from '../../model/block/block4description.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { DescriptionValueOperation } from '../../../common/operation/attribute/description-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';

export class BlockUpdateOperation {

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
            description: {attribute: true},
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
    try {
      await this.transaction.update(BlockEntity, {id}, {
        id: WrongDataException.assert(input.id, 'BlockEntity id expected'),
        sort: input.sort,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkBlock(input.id);

    await new PermissionValueOperation(this.transaction, Block2permissionEntity).save(beforeItem, input.permission);
    await new FlagValueOperation(this.transaction, beforeItem).save(Block2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, beforeItem).save(Block4stringEntity , pack.string);
    await new PointValueOperation(this.transaction, Block4pointEntity).save(beforeItem, pack.point);
    await new DescriptionValueOperation(this.transaction, Block4descriptionEntity).save(beforeItem, pack.description);

    return input.id;
  }

}