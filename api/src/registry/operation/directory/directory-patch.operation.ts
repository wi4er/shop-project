import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { DirectoryInput } from '../../input/directory/directory.input';
import { Directory2flagEntity } from '../../model/directory/directory2flag.entity';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';

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
    if (input.flag) await new FlagValueOperation(this.transaction, beforeItem).save(Directory2flagEntity, input.flag);
    if (input.permission) {
      await new PermissionValueOperation(
        this.transaction,
        Directory2permissionEntity,
      ).save(beforeItem, input.permission);
    }

    return input.id ? input.id : id;
  }

}