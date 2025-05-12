import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { DirectoryInput } from '../../input/directory.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Directory2flagEntity } from '../../model/directory2flag.entity';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission-value-update.operation';
import { Directory2permissionEntity } from '../../model/directory2permission.entity';

export class DirectoryPatchOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(DirectoryEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
            permission: {group: true},
          },
        }),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: DirectoryInput): Promise<string> {
    if (input.id) await this.transaction.update(DirectoryEntity, {id}, {id: input.id});

    const beforeItem = await this.checkDirectory(input.id ? input.id : id);
    if (input.flag) await new FlagValueUpdateOperation(this.transaction, Directory2flagEntity).save(beforeItem, input);
    if (input.permission) await new PermissionValueUpdateOperation(this.transaction, Directory2permissionEntity).save(beforeItem, input);

    return input.id ? input.id : id;
  }

}