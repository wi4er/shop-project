import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PermissionValueInsertOperation } from '../../../common/operation/permission-value-insert.operation';
import { RegistryPermissionInput } from '../../input/registry-permission.input';
import { RegistryPermissionEntity } from '../../model/registry-permission.entity';
import { RegistryPermission2permissionEntity } from '../../model/registry-permission2permission.entity';

export class RegistryPermissionInsertOperation {

  created: RegistryPermissionEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new RegistryPermissionEntity();
  }

  /**
   *
   */
  async save(input: RegistryPermissionInput): Promise<number> {

    try {
      await this.transaction.insert(RegistryPermissionEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.detail);
    }

    await this.transaction.save(this.created);

    await new PermissionValueInsertOperation(this.transaction, RegistryPermission2permissionEntity).save(this.created, input);

    return this.created.id;
  }

}