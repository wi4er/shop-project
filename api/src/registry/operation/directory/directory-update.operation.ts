import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Directory4stringEntity } from '../../model/directory4string.entity';
import { Directory2flagEntity } from '../../model/directory2flag.entity';
import { DirectoryInput } from '../../input/directory.input';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission-value-update.operation';
import { Directory2permissionEntity } from '../../model/directory2permission.entity';

export class DirectoryUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    const dirRepo = this.transaction.getRepository(DirectoryEntity);

    return NoDataException.assert(
      await dirRepo.findOne({
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
    try {
      await this.transaction.update(DirectoryEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Directory id expected!'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkDirectory(input.id);

    await new FlagValueUpdateOperation(this.transaction, Directory2flagEntity).save(beforeItem, input);
    await new PermissionValueUpdateOperation(this.transaction, Directory2permissionEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.transaction, Directory4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}