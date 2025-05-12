import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission-value-update.operation';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { AccessInput } from '../../../personal/input/access.input';
import { Access2permissionEntity } from '../../../personal/model/access/access2permission.entity';

export class RegistryPermissionUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkPermission(id: number): Promise<AccessEntity> {
    const dirRepo = this.transaction.getRepository(AccessEntity);

    return NoDataException.assert(
      await dirRepo.findOne({
        where: {id},
        relations: {
          permission: {group: true},
        },
      }),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(
    id: number,
    input: AccessInput,
  ): Promise<number> {
    try {
      await this.transaction.update(AccessEntity, {id}, {
        id: input.id,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkPermission(input.id);

    await new PermissionValueUpdateOperation(this.transaction, Access2permissionEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}