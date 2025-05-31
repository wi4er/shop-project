import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../../common/operation/string/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag/flag-value-update.operation';
import { BlockInput } from '../../input/block.input';
import { Block4stringEntity } from '../../model/block/block4string.entity';
import { Block2flagEntity } from '../../model/block/block2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission/permission-value-update.operation';
import { PointValueUpdateOperation } from '../../../common/operation/point/point-value-update.operation';
import { Block2permissionEntity } from '../../model/block/block2permission.entity';
import { Block4pointEntity } from '../../model/block/block4point.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { DescriptionValueUpdateOperation } from '../../../common/operation/description/description-value-update.operation';
import { Block4descriptionEntity } from '../../model/block/block4description.entity';

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
        id: WrongDataException.assert(input.id, 'Block id expected'),
        sort: input.sort,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkBlock(input.id);

    await new PermissionValueUpdateOperation(this.transaction, Block2permissionEntity).save(beforeItem, input);
    await new FlagValueUpdateOperation(this.transaction, Block2flagEntity).save(beforeItem, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.transaction, Block4stringEntity).save(beforeItem, pack.string);
    await new PointValueUpdateOperation(this.transaction, Block4pointEntity).save(beforeItem, pack.point);
    await new DescriptionValueUpdateOperation(this.transaction, Block4descriptionEntity).save(beforeItem, pack.description);

    return input.id;
  }

}