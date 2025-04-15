import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { BlockInput } from '../input/block.input';
import { Block4stringEntity } from '../model/block4string.entity';
import { Block2flagEntity } from '../model/block2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { PermissionValueUpdateOperation } from '../../common/operation/permission-value-update.operation';
import { PointValueUpdateOperation } from '../../common/operation/point-value-update.operation';
import { Block2permissionEntity } from '../model/block2permission.entity';
import { Block4pointEntity } from '../model/block4point.entity';

export class BlockUpdateOperation {

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
          string: {property: true},
          point: {property: true, point: true},
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

    await new PermissionValueUpdateOperation(this.manager, Block2permissionEntity).save(beforeItem, input);
    await new FlagValueUpdateOperation(this.manager, Block2flagEntity).save(beforeItem, input);

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Block4stringEntity).save(beforeItem, stringList);
    await new PointValueUpdateOperation(this.manager, Block4pointEntity).save(beforeItem, pointList);

    return beforeItem.id;
  }

}