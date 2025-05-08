import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission-value-update.operation';
import { RegistryPermissionEntity } from '../../model/registry-permission.entity';
import { RegistryPermissionInput } from '../../input/registry-permission.input';
import { RegistryPermission2permissionEntity } from '../../model/registry-permission2permission.entity';

export class RegistryPermissionUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkPermission(id: number): Promise<RegistryPermissionEntity> {
    const dirRepo = this.transaction.getRepository(RegistryPermissionEntity);

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
    input: RegistryPermissionInput,
  ): Promise<number> {
    try {
      await this.transaction.update(RegistryPermissionEntity, {id}, {
        id: input.id,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkPermission(input.id);

    await new PermissionValueUpdateOperation(this.transaction, RegistryPermission2permissionEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}