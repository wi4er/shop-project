import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PermissionValueInsertOperation } from '../../../common/operation/permission-value-insert.operation';
import { AccessInput } from '../../../personal/input/access.input';
import { AccessEntity } from '../../../personal/model/access/access.entity';
import { Access2permissionEntity } from '../../../personal/model/access/access2permission.entity';

export class RegistryPermissionInsertOperation {

  created: AccessEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new AccessEntity();
  }

  /**
   *
   */
  async save(input: AccessInput): Promise<number> {

    try {
      await this.transaction.insert(AccessEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.detail);
    }

    await this.transaction.save(this.created);

    await new PermissionValueInsertOperation(this.transaction, Access2permissionEntity).save(this.created, input);

    return this.created.id;
  }

}